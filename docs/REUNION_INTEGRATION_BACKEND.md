# REUNION - Integration Frontend SIG <-> Backend Tracker
# Implications pour chacun & Questions a l equipe backend

Date : reunion du jour
Participants : Equipe Frontend SIG / Equipe Backend Tracker / (Product Owner)
Objectif : arbitrer les modalites d integration des interfaces SIG au backend reel.

=====================================================================
1. CONTEXTE EN UNE PHRASE
=====================================================================
Le frontend SIG a ete construit sur des donnees fictives (mocks "macro pays").
Le backend backend_tracker est une API de gestion de portefeuille multi-actifs.
Les deux ne parlent pas du meme metier : il faut decider quoi brancher, comment, et avec quels acces.


=====================================================================
2. CE QUI EST BRANCHABLE vs CE QUI NE L EST PAS
=====================================================================

TABLEAU A - Interfaces directement branchables sur le backend
---------------------------------------------------------------------
| Interface SIG        | Endpoint backend                        | Statut   |
|----------------------|-----------------------------------------|----------|
| Indicators (macro)   | GET /uemoa/indicators, /uemoa/series    | PUBLIC   |
| Markets (FX/actifs)  | GET /instrument, /price-history/*       | PROTEGE  |
| Calendar             | GET /news/economic-calendar/*           | PROTEGE  |
| Alerts               | GET /alerts (scope utilisateur)         | PROTEGE  |
| Watchlist            | GET /watchlists (+instruments)          | PROTEGE  |
| Reports / News       | GET /news/breaking, /news/most-read     | PROTEGE  |
| Settings (profil)    | GET /auth/me, PATCH /users/:id          | PROTEGE  |
| (a creer) Portefeuille| /portfolio, /transaction, /positions   | PROTEGE  |
---------------------------------------------------------------------

TABLEAU B - Interfaces SANS modele backend (restent cote frontend)
---------------------------------------------------------------------
| Interface SIG        | Raison                                   | Decision a prendre          |
|----------------------|------------------------------------------|-----------------------------|
| Regimes (par pays)   | Aucun modele "regime" en base            | Mock assume ou moteur client|
| Rating / Score pays  | Aucun modele "notation" en base          | Mock assume ou moteur client|
| Screener (pays)      | Pas de screening pays backend            | Mock / repositionner        |
| Global Overview (KPI)| KPI mondiaux non calcules cote serveur   | Mock / recalcul client      |
| Policy Tracker       | Banques centrales non modelisees         | Mock + taux BCEAO via UEMOA |
---------------------------------------------------------------------


=====================================================================
3. IMPLICATIONS POUR CHACUN  (le coeur de la reunion)
=====================================================================

---------------------------------------------------------------------
3.1 IMPLICATIONS POUR L EQUIPE BACKEND
---------------------------------------------------------------------
I1. ACCES AUX ROUTES PROTEGEES
    - news, instrument, price-history, watchlists, alerts exigent un JWT.
    - Options :
      (a) fournir un compte de service (email + mdp, role USER ou ANALYSTE) ;
      (b) marquer certaines routes en @Public() si les donnees sont non sensibles.
    -> IMPACT : si (b), modification du code backend + revue de securite.

I2. CORS
    - CORS_ORIGIN doit inclure l origine du frontend (ex http://localhost:5173 en dev,
      et l URL de prod ensuite). Sans cela le navigateur bloque les appels.
    -> IMPACT : simple variable d environnement a ajuster.

I3. PREFIXE D API
    - Aucun prefixe global : routes a la racine (/news, /uemoa...), Swagger sur /api.
    - Confirmer que c est l etat definitif.
    -> IMPACT : le frontend cible http://host:3000/... ; si changement, concerter.

I4. FORMAT DES DONNEES
    - Champs en snake_case (series_code, fetched_at, asset_class) ; montants = Decimal -> string.
    - Confirmer que ce contrat est stable.
    -> IMPACT : on adapte cote frontend (normalisation), pas de changement backend.

I5. DISPONIBILITE / ENVIRONNEMENT
    - Fournir une URL d API accessible (VPS / staging) OU confirmer usage local (Docker).
    -> IMPACT : conditionne nos tests d integration de bout en bout.

I6. MODELE MANQUANT POUR LES PAGES MACRO-PAYS
    - Regimes / Rating / Screener pays n existent pas en base.
    - Question : envisage-t-on un modele "macro/regime" cote backend a terme ?
    -> IMPACT : si oui, cadrage produit a prevoir ; sinon, scoring cote frontend.

I7. BASE NEON
    - Confirmer que DATABASE_URL (Neon) est configure COTE BACKEND uniquement.
    - Le frontend n accede jamais directement a la base.
    -> IMPACT : aucun. Simple confirmation de perimetre.

---------------------------------------------------------------------
3.2 IMPLICATIONS POUR L EQUIPE FRONTEND
---------------------------------------------------------------------
F1. Couche de services HTTP a construire
    - client/src/services/ : client fetch centralise, gestion erreurs, X-Request-ID.

F2. Authentification
    - Ecran de connexion minimal + stockage access_token / refresh_token + refresh automatique
      sur reponse 401.

F3. Normalisation des donnees
    - Convertir snake_case -> camelCase, Decimal string -> number, ISO -> libelles FR.

F4. Strategie de fallback (anti-regression)
    - Conserver les mocks comme fallback (useQuery fallbackData) : si l API est indisponible,
      l UI reste utilisable. Mocks = filet de securite, API = source primaire.

F5. Repenser 2 interfaces dont la semantique differe du backend
    - Watchlist : gere des INSTRUMENTS, pas des pays -> adapter le vocabulaire et les colonnes.
    - Alerts : alertes de seuils prix/instrument, pas signaux macro -> clarifier le contenu.

F6. Pages macro-pays
    - Decider : badge "donnees de demonstration" OU moteur de scoring local.

---------------------------------------------------------------------
3.3 IMPLICATIONS PRODUIT / METIER (PO)
---------------------------------------------------------------------
P1. Arbitrer le positionnement : "outil macro-pays" vs "tracker de portefeuille".
    Le backend oriente clairement vers le portefeuille.
P2. Definir la valeur des pages dont le backend n a pas de donnees (Regimes, Rating...).
P3. Prioriser les modules a brancher (proposition : News/Calendrier, UEMOA, Instruments).

---------------------------------------------------------------------
3.4 RISQUES TRANSVERSES
---------------------------------------------------------------------
R1. Semantique divergente (watchlist/alerts) -> risque de confusion utilisateur.
R2. Dependance aux acces (compte de service, CORS, URL) -> peut bloquer le planning.
R3. Donnees fictives persistantes -> risque de confusion si non signalees clairement.


=====================================================================
4. QUESTIONS A POSER A L EQUIPE BACKEND  (liste exhaustive)
=====================================================================

>>> ACCES & SECURITE
Q1.  Peut-on obtenir un compte de service (email + mot de passe) avec role USER ou ANALYSTE
     pour les routes protegees (news, instrument, price-history, watchlists, alerts) ?
Q2.  Alternativement, certaines de ces routes peuvent-elles etre passees en @Public() ?
     Si oui, lesquelles et quel risque acceptez-vous ?
Q3.  La duree de vie de l access_token et du refresh_token est-elle configurable ?
     Quelles valeurs en dev et en prod ?
Q4.  Y a-t-il un rate limiting (Throttler) qui pourrait limiter nos appels frontend ? Quelles limites ?

>>> RESEAU & DEPLOIEMENT
Q5.  Quelle est l URL de l API accessible (VPS / staging / prod) ? Sinon confirmation du local Docker.
Q6.  Le CORS_ORIGIN peut-il inclure http://localhost:5173 (dev) et l URL de prod ?
Q7.  L API est-elle exposee en HTTPS ? Y a-t-il un certificat valide (evite les blocages navigateur) ?
Q8.  Le prefixe /api est-il definitivement reserve a Swagger, les routes restant a la racine ?

>>> CONTRAT DE DONNEES
Q9.  Le schema Prisma (snake_case, Decimal -> string) est-il stable ? Une doc OpenAPI/Swagger
     exportable (JSON) peut-elle etre partagee pour generer nos types ?
Q10. Les reponses de liste sont-elles paginees (limit/offset, meta total) ? Format exact ?
Q11. Y a-t-il des exemples de reponses reelles (jeux de donnees de test) pour valider le mapping ?

>>> MODELE & PERIMETRE FONCTIONNEL
Q12. Prevu de modeliser les "regimes macro" et la "notation pays" cote backend ? Si oui, quel horizon ?
Q13. La Watchlist est liee aux instruments : comment representer le suivi d un pays / d une zone ?
Q14. Le flux /news est-il alimente automatiquement (source ?) ou saisi manuellement (ADMIN/ANALYSTE) ?
Q15. Le module UEMOA via DBnomics : quelles series sont disponibles aujourd hui ? Quelle frequence de sync ?
Q16. Existe-t-il un endpoint de recherche globale (pays, instruments, evenements) ?

>>> EXPLOITATION
Q17. Environnement de staging disponible pour nos tests, ou partage de la base dev ?
Q18. Contact/qui fait foi pour valider les changements de contrat d API ?
Q19. .env.example a jour a disposition (variables necessaires : JWT, DB, REDIS, CORS) ?
Q20. (Neon) Confirmation que la base Neon est bien rattachee au backend uniquement ?


=====================================================================
5. PROPOSITION DE PLAN (a valider en seance)
=====================================================================
Etape 1 (sans dependance)  : couche service + module UEMOA (routes PUBLIQUES) -> testable immediatement.
Etape 2 (apres acces)      : Auth (login + refresh) -> debloque les routes protegees.
Etape 3                    : News + Calendrier -> Reports & Alerts.
Etape 4                    : Instruments + Price History -> Markets & Sparklines.
Etape 5                    : Watchlists (repositionnee sur les instruments).
Etape 6                    : Module Portefeuille (nouveau) - plus forte valeur backend.
Transversal                : mocks conservees en fallback ; zero regression visuelle.


=====================================================================
6. DECISIONS ATTENDUES A L ISSUE DE LA REUNION
=====================================================================
[ ] Acces routes protegees : compte de service OU routes @Public() -> QUI / QUAND
[ ] URL d API retenue (dev / staging / prod)
[ ] CORS_ORIGIN mis a jour par le backend
[ ] Sort des pages macro-pays (mock signale OU moteur de scoring)
[ ] Semantique Watchlist / Alerts clarifiee
[ ] Priorisation des modules a brancher
