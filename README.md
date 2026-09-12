# Bookshelf

Une app mobile de lecture, faite avec Expo et React Native pour le rattrapage
d'architecture mobile.

L'idée : on te propose un livre du jour, tu te fais une liste de livres à lire,
et tu notes ceux que tu as finis.

https://github.com/user-attachments/assets/53f2852e-23ed-4b56-bd39-7aac4698cb70

---

## Vidéo explicative

> [Lien de la vidéo](https://youtu.be/au8GC3ydUuY)
---

## Comment l'installer

Il faut Node.js (version 20 ou plus) et npm.

```bash
git clone <url-du-repo>
cd 03-architecture-mobile-react-native
npm install
npx expo start
```

Ensuite il faut scanner le QR code avec l'app Expo Go sur son téléphone, ou appuyer sur `i` pour le
simulateur iOS et `a` pour l'émulateur Android si ils sont installés sur l'ordinateur.

**Pas besoin de clé d'API**, l'app tape sur OpenLibrary qui est ouvert à tout le
monde. Il n'y a donc pas de fichier `.env` à créer.


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

## Ce qui n'est pas fini / les limites

- **Pas de tests automatiques.**

---

## Les commandes utiles

```bash
npx expo start          # lancer l'app
npx tsc --noEmit        # vérifier les types
npx expo lint           # vérifier le code
npx expo export         # vérifier que tout compile
```
