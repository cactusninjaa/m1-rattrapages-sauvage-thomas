import { View, Text, Button } from 'react-native';
import { useGetRecommendationBook } from '../hooks/useGetRecommendationBook';

export default function Index() {
  const queryRecommendationBook = useGetRecommendationBook()
  const recommendationBook = queryRecommendationBook.data

  const handleRefetch = () => {
    queryRecommendationBook.refetch()
  }

  if (queryRecommendationBook.isLoading) return (
    <View>
      <Text>Chargement...</Text>
    </View>
  );
  if (queryRecommendationBook.isError || !recommendationBook) return (
    <View>
      <Text>Erreur lors du chargement</Text>
      <Text>{queryRecommendationBook.error?.message}</Text>
    </View>
  );
  return (
    <View>
      <Text>{recommendationBook.title}</Text>
      <Text>{recommendationBook.author}</Text>
      <Button onPress={handleRefetch} title='Changer le livre'></Button>
    </View>
  );
}
