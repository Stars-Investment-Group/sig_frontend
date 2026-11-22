# Les données BCEAO et UMOA-Titres — correspondance vérifiée

Établi le 2026-11-22, par lecture croisée de trois sources : la base Neon, le
catalogue EDEN (`https://edenpub.bceao.int/`) interrogé directement, et les
deux documents de cadrage fournis par la direction — `SIG_Tracker_Eden_BCEAO.pdf`
et `SIG_tracker_UEMOA.pdf`.

**Tout ce qui suit est mesuré.** 2 496 variables ont été relevées dans EDEN sur
treize sous-secteurs, et chaque code cité ci-dessous a été retrouvé dans l'un
des deux catalogues. Ce qui n'a pas pu être vérifié est dit comme tel.

## Verdict sur les deux documents de cadrage

**Les 199 codes qu'ils citent existent tous dans EDEN.** Aucun code inventé,
aucune coquille de frappe : le travail de cadrage est juste sur le fond. Trois
corrections sont cependant nécessaires avant d'écrire le moindre extracteur,
et chacune produirait une erreur silencieuse — des données qui s'affichent
sans rien signaler, mais qui ne sont pas celles qu'on croit.

### Correction 1 — le préfixe pays n'est pas le code ISO

Les documents indiquent de remplacer `XX` par `BEN`, `CIV`, `SEN`… et donnent
l'exemple `SENSR1015A0BP`. **Ce code n'existe pas.** EDEN identifie chaque État
par **une lettre**, et le préfixe est cette lettre **répétée trois fois**.

| Pays | lettre EDEN | préfixe réel | le document dit |
|---|---|---|---|
| Côte d'Ivoire | `A` | **`AAA`** | ~~CIV~~ |
| Bénin | `B` | **`BBB`** | ~~BEN~~ |
| Burkina Faso | `C` | **`CCC`** | ~~BFA~~ |
| Mali | `D` | **`DDD`** | ~~MLI~~ |
| Niger | `H` | **`HHH`** | ~~NER~~ |
| Sénégal | `K` | **`KKK`** | ~~SEN~~ |
| Guinée-Bissau | `S` | **`SSS`** | ~~GNB~~ |
| Togo | `T` | **`TTT`** | ~~TGO~~ |
| UEMOA (agrégat) | `Z` | **`ZZZ`** | ZZZ ✓ |

Deux preuves indépendantes et concordantes : les cases à cocher `paysUemoa` du
formulaire EDEN portent ces lettres, et les 119 séries déjà en base Neon
portent exactement ces préfixes — `AAA`, `BBB`, `CCC`, `DDD`, `HHH`, `KKK`,
`SSS`, `TTT`, `ZZZ`, treize séries par pays et quinze pour l'agrégat. Aucune
série `SEN…` ou `CIV…` n'existe.

Le document a vu juste pour `ZZZ` sans voir la règle : `ZZZ`, c'est `Z` triplé.

### Correction 2 — un code ne sert qu'une seule fréquence

La colonne « Périodicité » des documents annonce souvent « Mensuelle /
Annuelle » pour un code unique. **La lettre de fréquence est dans le code**,
en septième position, et chaque code ne répond qu'à la sienne :

```
AAA   SR3   017   A   0BP      ← A = annuel
│     │     │     │   └── unité / type
│     │     │     └────── fréquence : J H M T S A
│     │     └──────────── numéro de la variable
│     └────────────────── sous-secteur
└──────────────────────── pays, la lettre EDEN triplée
```

Extraire `XXSR3017A0BP` en espérant du mensuel rend donc de l'annuel, sans
erreur ni avertissement. Le mensuel est `XXSR3017M0BP`, un **autre code**.

Pire : **le numéro de variable change parfois aussi**, et aucune règle ne
permet de le deviner.

| Série | code annuel | code mensuel |
|---|---|---|
| Indice des prix à la consommation | `SR3017A0BP` | `SR3017M0BP` *(même numéro)* |
| Cours de l'or | `SE4009A0GP` | `SE4009M0GP` *(même numéro)* |
| Cours du cacao | `SE4004A0GP` | `SE4004M0GP` *(même numéro)* |
| **Cours du dollar US** | `SF3100A0GP` | **`SF3102M0GP`** *(numéro différent)* |
| **Cours de la livre sterling** | `SF3109A0GP` | **`SF3111M0GP`** *(numéro différent)* |
| **Cours du yen** | `SF3112A0GP` | **`SF3114M0GP`** *(numéro différent)* |

Les matières premières gardent leur numéro, les taux de change le changent. La
correspondance doit donc se faire **par libellé, sous-secteur par
sous-secteur**, jamais par arithmétique sur le code.

### Correction 3 — deux libellés à rectifier

**Le taux directeur.** `SIG_tracker_UEMOA.pdf` ligne 60 donne `ZZZSF3201H0AP`
pour « Taux directeur UMOA (guichet de prêt marginal) ». EDEN appelle cette
série **« Taux des prises en pension de l'UMOA »** — le taux de pension, pas
le guichet de prêt marginal. Ce sont deux taux distincts de la BCEAO. Dans la
liste hebdomadaire, aucune série ne donne le taux du guichet de prêt marginal :
la plus proche, `SF3213H0AP`, est un *encours de refinancement*, donc un
montant et non un taux. **Le taux directeur au sens du document n'est pas dans
EDEN sous cette forme** — à arbitrer avant d'alimenter le Tracker de Politique,
qui affiche aujourd'hui un « taux directeur BCEAO ».

**L'euro.** Les lignes 72 et 73 donnent **le même code** `ZZZSF3109A0GP` pour
le cours de l'euro et celui de la livre sterling. EDEN n'en connaît qu'un :
c'est la livre. Il n'existe aucune série de cours euro/FCFA dans `SF3` — et
c'est normal, le franc CFA est **arrimé à l'euro à parité fixe** (655,957), il
n'y a donc pas de cours de marché à publier. La ligne 72 est à supprimer.

## Ce que les documents débloquent vraiment

Au-delà des quinze séries déjà en base, les documents pointent des familles
qu'EDEN sert en **quotidien et en hebdomadaire** — et qui alimenteraient des
blocs aujourd'hui entièrement fabriqués.

| Famille | Fréquence | Codes | Ce que ça remplace |
|---|---|---|---|
| Bons du Trésor et obligations, taux moyen pondéré par maturité | **quotidienne** | `SF3300J0AP` → `SF3343J0AP` | le bloc *rendements souverains* de Marchés |
| Indice BRVM Composite, volumes et valeurs échangés | **quotidienne** | `SF3037J0AP`, `SF3025J0AP`… | le bloc *actions* de Marchés |
| Taux de pension, interbancaires 1 jour → 3 mois, injections de liquidité | **hebdomadaire** | `SF3201H0AP` → `SF3220H0AP` | le Tracker de Politique |
| Taux débiteurs et créditeurs des banques | mensuelle | `SF2100M0AP`, `SF2126M0AP` | — |
| Taux de change (12 devises) | mensuelle | `SF3102M0GP`… | le bloc *devises* de Marchés |
| Cours des matières premières (16) | mensuelle | `SE4001M0GP` → `SE4017M0GP` | le bloc *matières premières* de Marchés |

C'est un changement d'échelle : la page Marchés et le Tracker de Politique
sont aujourd'hui alimentés par des fixtures, et ces séries-là sont réelles,
publiques et quotidiennes.

## Les 15 séries déjà en base, et leur équivalent mensuel

| Notre code | Ce qu'il mesure | Mensuel ? | Code mensuel |
|---|---|---|---|
| `SF1412A0AP` | Masse monétaire (M2) | **oui** | `SF1412M0AP` |
| `SF1413A0AP` | Actifs extérieurs nets | **oui** | `SF1413M0AP` |
| `SF1420A0AP` | Créances intérieures | **oui** | `SF1420M0AP` |
| `SF3100A0GP` | Cours du dollar US | **oui** | `SF3102M0GP` |
| `SF3109A0GP` | Cours de la livre sterling | **oui** | `SF3111M0GP` |
| `SR3017A0BP` | Indice des prix à la consommation | **oui** | `SR3017M0BP` |
| `SR3072A0BP` | Taux d'inflation | **oui, sous réserve** | voir ci-dessous |
| `SR1015A0BP` | PIB nominal | non | — |
| `SR1041A0BP` | Taux de croissance du PIB réel | non | — |
| `SR1023A0BP` / `SR1024A0BP` | Exportations / importations | non | — |
| `FP1043A0AP` | Solde budgétaire global, avec dons | non | — |
| `FP3001A0FA` | Encours de la dette | non | — |
| `SE1400A0AP` / `SE1488A0AP` | Transactions courantes, balance/PIB | non | — |

**Aucun des quinze n'existe en trimestriel.** Et les huit « non » tiennent à la
nature des statistiques, pas à EDEN : `SR1` comptes nationaux, `FP1` TOFE,
`FP3` dette et `SE1` balance des paiements ne publient **que** de l'annuel —
0 variable mensuelle sur 55, 70, 13 et 355 respectivement. Un PIB ou un TOFE se
compile une fois l'an ; aucun fournisseur n'y changera rien.

### L'arbitrage restant : quelle inflation ?

Notre série annuelle `SR3072A0BP` est **« Taux d'inflation en moyenne
annuelle »**. Le document de cadrage distingue correctement deux séries :

- `XXSR3072A0BP` — inflation en **moyenne annuelle**
- `XXSR3073A0BP` — inflation en **glissement annuel à fin décembre**

Les deux existent, vérifié. Mais au relevé du catalogue mensuel, `SR3072M0BP`
porte le libellé **« Taux d'inflation en glissement annuel »** : à fréquence
mensuelle, une moyenne annuelle glissante et un glissement annuel se
confondent dans la nomenclature d'EDEN. Avant de brancher, il faut donc dire
laquelle des deux définitions le Tracker affiche, parce que les deux donnent
des chiffres différents sous le même mot « inflation ».

Trois sorties possibles :

1. prendre le glissement annuel et **corriger le libellé** à l'écran ;
2. garder la moyenne annuelle et ajouter le glissement comme série distincte ;
3. recalculer la moyenne annuelle depuis l'IPC mensuel `SR3017M0BP`, qui est
   une correspondance exacte.

## L'extraction depuis EDEN

EDEN est une application PHP à formulaires, sans API, mais scriptable. La
chaîne a été parcourue :

1. `GET /` une fois, **en gardant le cookie `PHPSESSID`**. Sans la session,
   chaque point d'entrée rend un `<table></table>` vide, qui se lit exactement
   comme « aucune donnée ». C'est le détail qui fait paraître le portail mort
   alors qu'il répond.
2. `POST secteursDAO.php` avec `idSecteur=<code>` → les sous-secteurs. Codes
   **alphanumériques** : `SR` réel, `SF` monétaire et financier, `FP` finances
   publiques, `SE` extérieur, `SS` social.
3. `POST variablesDAO.php` avec `idSousSecteur`, `idLocalite`, `idFrequence` →
   le catalogue, en table HTML de code + libellé.
4. `POST rapport.php` → l'extraction. **Cette dernière étape n'aboutit pas
   encore** : la requête rend le formulaire au lieu d'un rapport, il manque au
   moins un champ. C'est du travail restant, pas une inconnue.

Le portail sert par ailleurs **neuf balises `<php echo …?>` non interprétées**
(un `<php` au lieu de `<?php`), dont une dans le sélecteur de secteur, qui
arrive donc malformé. Avec le comportement silencieux sans session, cela
explique probablement les difficultés d'accès signalées.

Il coupe enfin après une rafale de requêtes : l'extracteur devra les espacer.

### Ce qui reste non établi

La **couverture réelle jusqu'en 2026 n'est pas démontrée**. Les listes
d'années de la page d'accueil s'arrêtent à 2025, mais elles sont remplies par
AJAX selon la fréquence : ce n'est pas un plafond prouvé. Le dernier mois
disponible par série se vérifiera extracteur en main.

## UMOA-Titres — les courbes de taux

UMOA-Titres publie chaque mois un classeur `COURBES-DE-TAUX…xlsx`. Un onglet
par État, une ligne par maturité, deux colonnes : **taux zéro coupon** et
**taux après lissage**. Les taux y sont stockés en **fractions** — `0,0984`
vaut 9,84 %.

`scripts/lire-courbes-taux.py` lit un dossier de ces classeurs et rend le JSON
attendu par `sovereign_yields`. Mesuré sur les deux classeurs fournis :

| Classeur | Points | Pays |
|---|---|---|
| 2024-04-08 | 109 | 8 |
| 2026-08-14 | 117 | 8 |

**La structure est identique entre 2024 et 2026** — seuls l'ordre des onglets
et la grille des maturités changent, et le lecteur ne présume ni l'un ni
l'autre. Il lit la date dans le classeur lui-même (numéro de série Excel) et
retombe sur le nom du fichier.

Deux points de méthode :

- **La variation en points de base devient calculable.** Le script compare le
  dernier relevé au précédent, par couple (pays, maturité). La maquette
  affiche aujourd'hui `-8 bps` écrit à la main. Avec des relevés mensuels
  consécutifs, ces écarts auront un sens ; sur deux classeurs distants de
  vingt-huit mois, ils sont grands et ne veulent rien dire.
- **Quelle colonne afficher ?** Le script conserve les deux. Le taux après
  lissage est celui que la courbe officielle présente, et c'est le défaut
  retenu pour `yieldRate` ; le zéro coupon reste à côté. À confirmer.

Le site `umoatitres.org` **refuse les accès automatisés** (HTTP 403 sur la
racine comme sur les pages de statistiques) : la collecte manuelle est la
bonne méthode, un script ne ferait pas mieux.

Noter enfin que les mêmes rendements existent dans EDEN en **quotidien**
(`SF3300J0AP` → `SF3343J0AP`, taux moyens pondérés par maturité). Les deux
sources ne disent pas la même chose — EDEN donne des résultats
d'adjudication, UMOA-Titres une courbe ajustée — et elles sont
complémentaires plutôt que redondantes.
