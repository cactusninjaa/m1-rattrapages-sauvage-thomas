import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import ScreenHeader from '@/components/ScreenHeader';
import BookCover from '@/components/BookCover';
import SectionLabel from '@/components/SectionLabel';
import EmptyState from '@/components/EmptyState';
import { useGetRecommendationBook } from '@/hooks/useGetRecommendationBook';
import { useReadList, useAddToReadList } from '@/hooks/useReadList';
import { colors, fonts, spacing } from '@/constants/theme';

export default function Index() {
  const queryRecommendationBook = useGetRecommendationBook()
  const recommendationBook = queryRecommendationBook.data

  const { data: readList = [] } = useReadList()
  const addToReadList = useAddToReadList()

  const alreadyAdded = recommendationBook
    ? readList.some((stored) => stored.gutembergId === recommendationBook.gutembergId)
    : false

  const handleRefetch = () => {
    queryRecommendationBook.refetch()
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Bookshelf" subtitle="Une lecture choisie pour vous" />

      <View style={styles.content}>
        <SectionLabel highlighted>Le livre du jour</SectionLabel>

        {queryRecommendationBook.isLoading ? (
          <ActivityIndicator color={colors.accent} style={styles.loader} />
        ) : queryRecommendationBook.isError || !recommendationBook ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Erreur lors du chargement"
            hint={queryRecommendationBook.error?.message}
          />
        ) : (
          <View style={styles.card}>
            <BookCover book={recommendationBook} width={96} height={146} titleSize={16} />
            <View style={styles.info}>
              <View>
                <Text numberOfLines={3} style={styles.title}>
                  {recommendationBook.title}
                </Text>
                <Text numberOfLines={2} style={styles.author}>
                  {recommendationBook.author.join(', ')}
                </Text>
              </View>

              <Pressable
                onPress={() => addToReadList.mutate(recommendationBook)}
                disabled={alreadyAdded}
                style={[styles.addButton, alreadyAdded && styles.addButtonDone]}
              >
                <Ionicons
                  name={alreadyAdded ? 'checkmark' : 'add'}
                  size={15}
                  color={alreadyAdded ? colors.green : colors.onAccent}
                />
                <Text style={[styles.addLabel, alreadyAdded && styles.addLabelDone]}>
                  {alreadyAdded ? 'Dans la ReadList' : 'ReadList'}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        <Pressable
          onPress={handleRefetch}
          disabled={queryRecommendationBook.isFetching}
          style={styles.refetchButton}
        >
          <Ionicons name="refresh" size={15} color={colors.textSoft} />
          <Text style={styles.refetchLabel}>
            {queryRecommendationBook.isFetching ? 'Recherche…' : 'Changer le livre'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.screen,
    gap: 11,
  },
  loader: {
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    gap: 15,
    padding: 15,
    borderRadius: 14,
    backgroundColor: '#1d191d',
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: colors.text,
    marginBottom: 4,
  },
  author: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  addButtonDone: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  addLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onAccent,
  },
  addLabelDone: {
    color: colors.green,
  },
  refetchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    height: 42,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  refetchLabel: {
    fontSize: 12.5,
    color: colors.textSoft,
  },
});
