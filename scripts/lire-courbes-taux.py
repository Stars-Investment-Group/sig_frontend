"""Lecteur des courbes de taux UMOA-Titres.

UMOA-Titres publie chaque mois un classeur `COURBES-DE-TAUX...xlsx` portant,
pour chacun des huit États de l'Union, la courbe des taux souverains : une
ligne par maturité, deux colonnes — le taux zéro coupon et le taux après
lissage. Ce script transforme un dossier de ces classeurs en un JSON que
`sovereign_yields` peut recevoir.

    python -I scripts/lire-courbes-taux.py <dossier> [sortie.json]

Pourquoi un script Python dans un dépôt JavaScript
--------------------------------------------------
Un `.xlsx` est une archive zip, et Node n'a pas de décompression en
bibliothèque standard : il faudrait une dépendance pour un outil qui tourne
une fois par mois, hors build. Python, lui, lit le format sans rien installer.
Le script ne dépend donc de rien et n'entre pas dans le bundle.

Ce qu'il ne fait pas
--------------------
Il n'écrit pas en base. Il produit un fichier que l'on relit — l'injection
reste une étape séparée et explicite, comme pour `seed-neon.mjs`.

Relevé sur les classeurs du 2024-04-08 et du 2026-08-14 : **la structure est
identique entre les deux**, seuls l'ordre des onglets et la grille des
maturités changent. Le lecteur ne présume donc ni l'un ni l'autre.
"""

import json
import re
import sys
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from datetime import date, timedelta
from pathlib import Path

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# Les onglets portent le nom du pays, l'application parle en ISO alpha-3.
PAYS = {
    "benin": "BEN",
    "burkina": "BFA",
    "cote divoire": "CIV",
    "cote d ivoire": "CIV",
    "guinee bissau": "GNB",
    "mali": "MLI",
    "niger": "NER",
    "senegal": "SEN",
    "togo": "TGO",
}

# Excel compte les jours depuis le 1900-01-00, avec le bogue de l'année
# bissextile de 1900 ; l'origine pratique est donc le 30 décembre 1899.
ORIGINE_EXCEL = date(1899, 12, 30)


def sans_accent(texte):
    t = unicodedata.normalize("NFD", texte or "")
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]+", " ", t.lower()).strip()


def code_pays(nom_onglet):
    cle = re.sub(r"\s+", " ", sans_accent(nom_onglet))
    return PAYS.get(cle)


def colonne(ref):
    lettres = re.match(r"[A-Z]+", ref or "A").group(0)
    n = 0
    for c in lettres:
        n = n * 26 + (ord(c) - 64)
    return n - 1


def mois_de(maturite):
    """« 3 mois » / « 10 ans » -> un nombre de mois, pour trier la courbe."""
    m = re.search(r"(\d+)\s*(mois|an)", sans_accent(maturite))
    if not m:
        return None
    n = int(m.group(1))
    return n if m.group(2) == "mois" else n * 12


def lignes_de(z, nom_fichier, chaines):
    """Rend les lignes d'une feuille, chacune en dict {index colonne: valeur}."""
    racine = ET.fromstring(z.read(nom_fichier))
    for row in racine.iter(f"{NS}row"):
        cells = {}
        for c in row.iter(f"{NS}c"):
            v = c.find(f"{NS}v")
            isx = c.find(f"{NS}is")
            if c.get("t") == "s" and v is not None:
                val = chaines[int(v.text)]
            elif isx is not None:
                val = "".join(t.text or "" for t in isx.iter(f"{NS}t"))
            elif v is not None:
                val = v.text
            else:
                continue
            val = (val or "").strip()
            if val:
                cells[colonne(c.get("r"))] = val
        if cells:
            yield cells


def date_du_classeur(chemin, toutes_cellules):
    """La date d'arrêté : celle du classeur, le nom du fichier en recours.

    Le classeur porte un numéro de série Excel isolé sous le tableau. On ne
    retient que ceux qui tombent dans une fenêtre plausible — un taux et une
    date sont tous deux des nombres, et rien ne les distingue autrement.
    """
    for brut in toutes_cellules:
        try:
            n = float(brut)
        except (TypeError, ValueError):
            continue
        if n.is_integer() and 40000 <= n <= 60000:  # 2009 à 2064
            return (ORIGINE_EXCEL + timedelta(days=int(n))).isoformat()

    m = re.search(r"(\d{2})[.\-](\d{2})[.\-](\d{4})", Path(chemin).name)
    if m:
        return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    return None


def lire_classeur(chemin):
    """Rend (date, [points]) pour un classeur."""
    z = zipfile.ZipFile(chemin)

    chaines = []
    if "xl/sharedStrings.xml" in z.namelist():
        racine = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in racine.iter(f"{NS}si"):
            chaines.append("".join(t.text or "" for t in si.iter(f"{NS}t")))

    noms = []
    if "xl/workbook.xml" in z.namelist():
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        noms = [sh.get("name") for sh in wb.iter(f"{NS}sheet")]

    feuilles = sorted(
        n for n in z.namelist() if re.match(r"xl/worksheets/sheet\d+\.xml$", n)
    )

    points = []
    brutes = []
    for i, f in enumerate(feuilles):
        nom = noms[i] if i < len(noms) else f
        code = code_pays(nom)
        if code is None:
            continue  # « Feuil1 » et tout onglet hors des huit États.

        col_mat = col_zc = col_lisse = None
        for cells in lignes_de(z, f, chaines):
            brutes.extend(cells.values())

            # L'en-tête donne la position des colonnes : elles ne sont pas
            # au même endroit d'un classeur à l'autre, et les présumer
            # produirait des taux décalés sans rien signaler.
            if col_mat is None:
                for idx, val in cells.items():
                    s = sans_accent(val)
                    if s.startswith("maturite"):
                        col_mat = idx
                    elif "zero coupon" in s:
                        col_zc = idx
                    elif "apres lissage" in s:
                        col_lisse = idx
                continue

            maturite = cells.get(col_mat)
            mois = mois_de(maturite or "")
            if mois is None:
                continue

            def taux(col):
                if col is None or col not in cells:
                    return None
                try:
                    # Le classeur stocke des fractions : 0,0984 vaut 9,84 %.
                    return round(float(cells[col]) * 100, 4)
                except ValueError:
                    return None

            points.append(
                {
                    "countryCode": code,
                    "maturity": re.sub(r"\s+", " ", maturite.strip()),
                    "mois": mois,
                    "zeroCoupon": taux(col_zc),
                    "apresLissage": taux(col_lisse),
                }
            )

    return date_du_classeur(chemin, brutes), points


def main(dossier, sortie=None):
    fichiers = sorted(Path(dossier).glob("*.xls*"))
    fichiers = [f for f in fichiers if "courbe" in sans_accent(f.name)]
    if not fichiers:
        print(f"aucun classeur « COURBES-DE-TAUX » dans {dossier}")
        return 1

    releves = {}
    for f in fichiers:
        try:
            quand, points = lire_classeur(f)
        except Exception as e:  # un classeur abîmé ne doit pas tout arrêter
            print(f"  {f.name} : ILLISIBLE — {str(e)[:80]}")
            continue
        if not quand:
            print(f"  {f.name} : date introuvable, ignoré")
            continue
        releves[quand] = points
        pays = len({p['countryCode'] for p in points})
        print(f"  {quand}  {f.name[:46]:<48} {len(points):>4} points · {pays} pays")

    if not releves:
        return 1

    dates = sorted(releves)
    dernier, precedent = dates[-1], (dates[-2] if len(dates) > 1 else None)

    # La variation en points de base, calculée contre le relevé précédent.
    # C'est ce que la maquette affiche aujourd'hui avec un chiffre inventé.
    avant = {}
    if precedent:
        avant = {
            (p["countryCode"], p["maturity"]): p["apresLissage"]
            for p in releves[precedent]
        }

    courbe = []
    for p in sorted(releves[dernier], key=lambda x: (x["countryCode"], x["mois"])):
        ancien = avant.get((p["countryCode"], p["maturity"]))
        bps = None
        if ancien is not None and p["apresLissage"] is not None:
            bps = round((p["apresLissage"] - ancien) * 100)
        courbe.append(
            {
                "instrumentName": f"Rendement {p['maturity']} {p['countryCode']}",
                "countryCode": p["countryCode"],
                "maturity": p["maturity"],
                "yieldRate": p["apresLissage"],
                "zeroCoupon": p["zeroCoupon"],
                "changeBps": bps,
                "asOf": dernier,
            }
        )

    resultat = {
        "source": "UMOA-Titres — courbes des taux",
        "arrete": dernier,
        "comparaison": precedent,
        "releves": len(releves),
        "courbe": courbe,
        "historique": releves,
    }

    print()
    print(f"arrêté retenu      : {dernier}")
    print(f"comparé à          : {precedent or '— (un seul relevé)'}")
    print(f"points de la courbe: {len(courbe)}")
    manquants = sum(1 for c in courbe if c["changeBps"] is None)
    if manquants:
        print(f"variations absentes: {manquants} (maturité sans équivalent au relevé précédent)")

    if sortie:
        Path(sortie).write_text(
            json.dumps(resultat, ensure_ascii=False, indent=1), encoding="utf-8"
        )
        print(f"écrit              : {sortie}")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None))
