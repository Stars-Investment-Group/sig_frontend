# Correspondance BCEAO — des 15 séries en base vers les séries mensuelles d'EDEN

Établi le 2026-11-22, par lecture croisée de la base Neon et du catalogue EDEN
(`https://edenpub.bceao.int/`). Tout ce qui suit est **mesuré**, pas supposé :
chaque code a été relevé dans l'un ou l'autre des deux catalogues.

Ce document répond à une question précise : *de quoi avons-nous besoin de
l'équipe data pour passer nos séries BCEAO en mensuel et les prolonger
au-delà de 2024 ?*

## Ce que la base Neon disait déjà

La question « peut-on voir ça au niveau de la base Neon ? » appelle un oui.
Les 119 séries stockées portent leurs **codes BCEAO d'origine**, et un code
BCEAO est entièrement structuré :

```
AAA   SR1   015   A   0BP
│     │     │     │   └── unité / type
│     │     │     └────── fréquence : A annuelle, M mensuelle, T trimestrielle
│     │     └──────────── numéro de la variable
│     └────────────────── sous-secteur
└──────────────────────── pays, la lettre EDEN triplée
```

Les lettres de pays d'EDEN sont `A` Côte d'Ivoire, `B` Bénin, `C` Burkina
Faso, `D` Mali, `H` Niger, `K` Sénégal, `S` Guinée-Bissau, `T` Togo, `Z`
UEMOA. D'où les préfixes `AAA` et `KKK` de nos séries : ce sont ces lettres,
répétées trois fois. Rien à deviner.

**Attention, le numéro de variable change aussi entre deux fréquences.**
Le cours du dollar est `SF3100` en annuel et `SF3102` en mensuel. Une simple
substitution de la lettre de fréquence produirait donc un code faux pour une
partie des séries. La correspondance ci-dessous a été faite **par libellé**,
sous-secteur par sous-secteur, pas par arithmétique sur le code.

## Les 15 indicateurs, et leur équivalent mensuel

| Notre code | Ce qu'il mesure | Mensuel ? | Code mensuel |
|---|---|---|---|
| `SF1412A0AP` | Masse monétaire (M2) | **oui** | `SF1412M0AP` |
| `SF1413A0AP` | Actifs extérieurs nets | **oui** | `SF1413M0AP` |
| `SF1420A0AP` | Créances intérieures | **oui** | `SF1420M0AP` |
| `SF3100A0GP` | Cours du dollar US | **oui** | `SF3102M0GP` |
| `SF3109A0GP` | Cours de la livre sterling | **oui** | `SF3111M0GP` |
| `SR3017A0BP` | Indice des prix à la consommation | **oui** | `SR3017M0BP` |
| `SR3072A0BP` | Taux d'inflation | **oui, sous réserve** | `SR3072M0BP` — voir ci-dessous |
| `SR1015A0BP` | PIB nominal | non | — |
| `SR1041A0BP` | Taux de croissance du PIB réel | non | — |
| `SR1023A0BP` | Exportations de biens et services | non | — |
| `SR1024A0BP` | Importations de biens et services | non | — |
| `FP1043A0AP` | Solde budgétaire global, avec dons | non | — |
| `FP3001A0FA` | Encours de la dette | non | — |
| `SE1400A0AP` | Compte des transactions courantes | non | — |
| `SE1488A0AP` | Balance courante rapportée au PIB | non | — |

**Aucun des quinze n'existe en trimestriel.** Le trimestriel d'EDEN se limite
à six variables dans `SF3` et une dans `SR3`, dont aucune ne correspond aux
nôtres.

### Les huit « non » ne sont pas un manque d'EDEN

Les sous-secteurs concernés ne publient **que** de l'annuel, et c'est dans la
nature des statistiques en question :

| Sous-secteur | Mensuel | Trimestriel | Annuel |
|---|---|---|---|
| `SR1` Comptes nationaux | 0 | 0 | 55 |
| `FP1` TOFE | 0 | 0 | 70 |
| `FP3` Dette publique extérieure | 0 | 0 | 13 |
| `SE1` Balance des paiements | 0 | 0 | 355 |
| `SR2` Production | 111 | 0 | 59 |
| `SR3` Prix | 96 | 1 | 42 |
| `SF1` Statistiques monétaires | 508 | 0 | 377 |
| `SF3` Marchés des capitaux et des changes | 50 | 6 | 12 |

Un PIB, un TOFE ou une balance des paiements se compilent une fois l'an. Aucun
changement de source n'y changera rien : ces quatre familles resteront
annuelles, quel que soit le fournisseur.

### Le seul vrai arbitrage : `SR3072`

C'est le seul rapprochement qui ne soit pas une identité, et il porte sur un
indicateur visible partout dans l'application.

- en base, annuel : **« Taux d'inflation en moyenne annuelle »**
- chez EDEN, mensuel : **« Taux d'inflation en glissement annuel »**

Ce sont **deux mesures différentes**, pas deux fréquences de la même mesure.
La moyenne annuelle compare deux moyennes de douze mois ; le glissement annuel
compare un mois au même mois de l'année précédente. Les deux sont légitimes et
ne donnent pas le même chiffre. Substituer l'une à l'autre changerait la
signification d'un indicateur sans que rien ne le signale à l'écran — très
exactement la famille de défauts que ce projet traque.

Trois sorties possibles, et c'est à l'équipe data de trancher :

1. on prend le glissement annuel et **on change le libellé** à l'écran ;
2. on garde la moyenne annuelle en annuel et on ajoute le glissement comme
   série distincte ;
3. on recalcule la moyenne annuelle à partir de l'IPC mensuel `SR3017M0BP`,
   qui lui est une correspondance exacte.

## Ce qu'il reste à demander à l'équipe data

Trois points, et aucun ne demande un accès particulier :

1. **valider les six correspondances exactes** du tableau (scores 0,99 à 1,00) ;
2. **trancher sur `SR3072`** — moyenne annuelle ou glissement annuel ;
3. **confirmer que les huit séries annuelles restent annuelles**, ou indiquer
   une autre source si l'une d'elles existe ailleurs en infra-annuel.

## Ce qui n'est pas établi

- **La couverture réelle jusqu'en 2026 n'est pas démontrée.** Les listes
  d'années de la page d'accueil s'arrêtent à 2025, mais ces listes sont
  remplies par AJAX selon la fréquence choisie, donc ce n'est pas un plafond
  prouvé. Le dernier mois disponible par série reste à vérifier, extracteur en
  main.
- **L'extraction elle-même n'est pas encore automatisée.** Le catalogue se
  parcourt par script (voir `CLAUDE.md`, section EDEN), mais `rapport.php`
  renvoie le formulaire plutôt qu'un rapport : il manque au moins un champ au
  POST. C'est du travail de rétro-ingénierie restant, pas une inconnue.
- Le portail coupe après une rafale de requêtes — l'extracteur devra espacer
  ses appels.

## UMOA-Titres, la source signalée le 2026-11-22

Le marché des titres publics de l'UEMOA publie ses adjudications en fichiers
Excel mensuels, de 2019 à 2026. `umoatitres.org` **refuse les accès
automatisés** (HTTP 403 sur la racine comme sur les pages de statistiques), ce
qui rend la collecte manuelle en cours la bonne méthode — un script ne ferait
pas mieux.

C'est la source qui manquait au bloc **rendements souverains** de la page
Marchés, aujourd'hui alimenté par des chiffres fabriqués (`sovereign_yields`,
semé depuis les fixtures). Ce serait la première donnée mesurée de cette page.

Pour écrire le lecteur sans attendre la fin du téléchargement, il suffit de
**deux ou trois fichiers d'exemple**, pris à des années différentes : la
structure des colonnes des fichiers de 2019 a toutes les chances d'avoir bougé
d'ici 2026, et c'est ce décalage qu'il faut voir avant d'écrire le code.
