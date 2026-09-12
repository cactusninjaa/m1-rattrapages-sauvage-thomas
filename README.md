# Bookshelf

Une app mobile de lecture, faite avec Expo et React Native pour le rattrapage
d'architecture mobile.

L'idée : on te propose un livre du jour, tu te fais une liste de livres à lire,
et tu notes ceux que tu as finis.

---

## Vidéo explicative

> ⚠️ **À REMPLIR AVANT LE RENDU** — lien Loom ou YouTube en non-répertorié.
>
> Lien : `...`
>
> La vidéo doit montrer une démo de l'app + l'explication technique du code
> (le prof demande les deux pour un rattrapage technique).

---

## Comment l'installer

Il faut Node.js (version 20 ou plus) et npm.

```bash
git clone <url-du-repo>
cd 03-architecture-mobile-react-native
npm install
npx expo start
```

Ensuite tu scannes le QR code avec l'app Expo Go, ou tu appuies sur `i` pour le
simulateur iOS et `a` pour l'émulateur Android.

**Pas besoin de clé d'API**, l'app tape sur OpenLibrary qui est ouvert à tout le
monde. Il n'y a donc pas de fichier `.env` à créer.

### ⚠️ Le scanner de code-barres ne marche pas dans Expo Go

J'utilise `expo-camera`, qui contient du code natif. Expo Go ne peut pas le
charger. Pour tester le scan il faut un build de développement, sur un vrai
téléphone (le simulateur n'a pas de caméra) :

```bash
npx expo run:ios      # ou : npx expo run:android
```

Tout le reste de l'app (recherche, readlist, avis) marche normalement dans
Expo Go.

---

## Ce que fait l'app

Quatre onglets :

| Onglet | Ce qu'on peut y faire |
|---|---|
| **Découvrir** | Un livre tiré au hasard chaque jour, qu'on peut ajouter à sa readlist ou re-tirer |
| **ReadList** | Chercher un livre (titre, auteur ou ISBN), l'ajouter, le retirer avec la croix sur la couverture |
| **Ajouter** | Choisir un livre, mettre une note sur 5 et un commentaire |
| **Mes avis** | Tous ses avis, avec des stats et un filtre par note. On glisse un avis vers la gauche pour le modifier ou le supprimer |

Tout est sauvegardé en local avec AsyncStorage, donc ça reste quand on ferme
l'app.

---

## Les technos utilisées

- **Expo SDK 57** + **expo-router** pour la navigation par fichiers
- **React Query** pour les appels réseau (cache, loading, erreurs)
- **AsyncStorage** pour sauvegarder la readlist et les avis
- **expo-camera** pour scanner les codes-barres
- **react-native-gesture-handler** pour le swipe sur les avis
- **date-fns** pour formater les dates en français

---

## Comment c'est rangé

```
src/
  app/            # uniquement les écrans (expo-router en fait des routes)
    _layout.tsx
    (tabs)/
  components/     # les bouts d'UI réutilisés
  hooks/          # les appels API et l'accès au stockage
  types/          # les types TypeScript
  utils/          # ISBN, AsyncStorage
  constants/      # couleurs, espacements
```

⚠️ Un truc que j'ai appris : **il ne faut rien mettre d'autre que des écrans dans
`src/app/`**. Au début j'avais mis mes hooks dedans, et expo-router essayait d'en
faire des routes. J'ai tout déplacé dans `src/`.

---

## Le gros changement : j'ai changé d'API en cours de route

C'est la partie dont je suis le plus content, donc je détaille.

### Au début : l'API Project Gutenberg

J'étais parti sur une API Project Gutenberg (via RapidAPI). Trois problèmes sont
apparus :

**1. La recherche ne marchait pas comme je croyais.** J'envoyais `?search=austen`,
je recevais un `200` avec des résultats, donc je pensais que c'était bon. En fait
le paramètre était **complètement ignoré** : peu importe ce que je cherchais, je
recevais toujours le catalogue entier dans le même ordre. J'ai testé plusieurs
noms de paramètres avant de trouver que le bon était `?q=`.

> C'est le genre de bug le plus vicieux : ça renvoie 200, ça renvoie des livres,
> tout a l'air de marcher.

**2. Impossible de chercher par ISBN.** Gutenberg n'a aucun champ ISBN dans ses
données (normal : ses livres sont pour la plupart plus vieux que l'ISBN). J'ai
d'abord bricolé : je demandais le titre à OpenLibrary à partir de l'ISBN, puis je
cherchais ce titre dans Gutenberg. Ça marchait mais ça faisait deux API pour une
seule recherche.

**3. Le vrai problème : il n'y a que du domaine public.** Gutenberg a environ
75 000 livres, tous libres de droits. Donc **on ne pouvait noter aucun livre
publié après 1929**. Pour une app d'avis de lecture, c'est quand même embêtant.

### Maintenant : OpenLibrary tout seul

J'ai comparé les deux sur les mêmes recherches :

| Recherche | Gutenberg | OpenLibrary |
|---|---|---|
| `frankenstein` | 8 résultats | 3 374 |
| ISBN de *The Catcher in the Rye* | 0 | 1 (le bon livre) |
| Recherche ISBN | impossible | native (`?isbn=`) |

Ce qui m'a décidé : **mon app n'utilisait jamais le texte des livres de
Gutenberg**, seulement le titre, l'auteur et la couverture. Donc je subissais la
limite « domaine public » sans profiter de ce que Gutenberg apporte d'unique
(les fichiers epub gratuits).

Du coup en passant sur OpenLibrary j'ai gagné :
- beaucoup plus de livres, y compris récents
- la recherche ISBN directe (plus besoin du bricolage à deux API)
- plus de clé d'API du tout, donc plus rien à cacher dans un `.env`

Deux détails que j'ai dû gérer :
- OpenLibrary limite à **1 requête par seconde**, et à 3 si on envoie un
  `User-Agent` qui identifie l'app. Je l'envoie donc (`src/hooks/index.ts`). Je
  m'en suis rendu compte en me faisant couper la connexion pendant mes tests.
- Leur réponse par défaut est énorme (des dizaines de champs, dont une liste de
  centaines d'éléments). Je demande donc explicitement les champs qui
  m'intéressent avec `&fields=`.

---

## Mes recherches sur internet

Les pages que j'ai vraiment consultées :

**Documentation Expo (SDK 57)**
- https://docs.expo.dev/versions/v57.0.0/sdk/camera/ — le scan de code-barres
  (`CameraView`, `onBarcodeScanned`, la config du plugin dans `app.json`)
- https://docs.expo.dev/versions/v57.0.0/sdk/image/ — `expo-image` et le `onError`
  qui me sert pour les couvertures manquantes
- https://docs.expo.dev/versions/v57.0.0/sdk/font/ — pour les polices
- https://docs.expo.dev/router/basics/core-concepts/ — c'est là que j'ai compris
  qu'il ne faut que des écrans dans `src/app/`

**OpenLibrary**
- https://openlibrary.org/developers/api — les limites de requêtes et le
  `User-Agent`
- https://openlibrary.org/search.json — l'endpoint de recherche, que j'ai testé à
  la main avec plein de paramètres différents

**react-native-gesture-handler**
- https://docs.swmansion.com/react-native-gesture-handler/ — pour le swipe.
  J'ai découvert que le `Swipeable` classique est **déprécié** et qu'il faut
  utiliser `ReanimatedSwipeable`

**RapidAPI (Project Gutenberg)**
- https://rapidapi.com/nagendracharyd/api/project-gutenberg-free-books-api1 — la
  doc était incomplète, c'est pour ça que j'ai dû tester les paramètres un par un

---

## Trucs que j'ai testés et qui n'ont pas marché

Je les note parce qu'ils font partie du travail :

- `?search=`, `?title=`, `?query=` sur Gutenberg → acceptés mais ignorés
- `?isbn=` sur Gutenberg → pareil, ignoré
- `sort=random` sur OpenLibrary pour tirer un livre au hasard → erreur 422, ça
  n'existe pas. J'utilise un `offset` aléatoire à la place
- Le scanner de code-barres avec Gutenberg → ça n'avait aucun sens puisque
  Gutenberg ne connaît pas les ISBN. Ça n'est devenu utile qu'avec OpenLibrary

---

## Choix que j'ai faits

**Pas de polices personnalisées.** La maquette utilise Instrument Serif et IBM
Plex. Pour éviter d'ajouter trois dépendances, j'utilise les polices système les
plus proches (Georgia et Menlo). Le rendu est un peu moins joli que la maquette.

**Modifier un avis se fait dans une petite fenêtre**, pas en retournant sur
l'écran « Ajouter ». Quand on modifie un avis on ne change que la note et le
commentaire, jamais le livre. Ça évitait de compliquer la navigation.

**Suppression dans la readlist : une croix sur la couverture.** J'ai mis le swipe
sur les avis parce que c'était demandé, mais sur une grille de couvertures à 3
colonnes ça n'allait pas. Avant j'avais un appui long, mais personne ne devine
qu'il faut faire un appui long.

**Les clés de stockage s'appellent `readList.v2` et `reviews.v2`.** Quand j'ai
changé d'API, la forme des données a changé. Le `.v2` fait que les anciennes
données sont ignorées au lieu de faire planter l'app.

---

## Ce qui n'est pas fini / les limites

Je préfère être honnête :

- **Je n'ai pas pu tester sur un vrai téléphone.** Le code compile
  (`npx tsc --noEmit`), le linter passe (`npx expo lint`) et le build passe
  (`npx expo export`), mais je n'ai pas pu vérifier le rendu ni les gestes.
- **Le swipe et le scanner sont à vérifier à la main**, ce sont des choses qui ne
  se jugent qu'au doigt sur un appareil.
- **Pas de tests automatiques.**
- Les commentaires du code sont en anglais comme demandé, mais **les textes
  affichés dans l'app sont en français** (c'est une app française).
- Sur l'écran « Mes avis », la maquette affichait « pages lues » dans les stats.
  OpenLibrary ne donne pas le nombre de pages, donc j'ai mis le nombre de livres
  dans la readlist à la place.

---

## Les commandes utiles

```bash
npx expo start          # lancer l'app
npx tsc --noEmit        # vérifier les types
npx expo lint           # vérifier le code
npx expo export         # vérifier que tout compile
```
