import React, {useEffect, useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import calculateDistance from './utils/calculateDistance.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 🚨 [필수] 여기에 두 개의 키를 각각 넣어주세요!
const MAPS_API_KEY = 'YOUR_MAPS_API_KEY_HERE';
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

interface Restaurant {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  distance?: number;
  rating?: number;
  reviewCount?: number;
}

const CATEGORIES = ['전체', '한식', '중식', '일식', '치킨', '분식', '카페'];

function App() {
  // 1. 위치 및 지도 관련 상태
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const mapRef = useRef<MapView>(null);
  
  // 2. 데이터 및 필터 관련 상태
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 3. 화면 모드 및 선택 관련 상태
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // 4. 룰렛 기능 관련 상태
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [rouletteText, setRouletteText] = useState("두근두근...");
  const [rouletteWinner, setRouletteWinner] = useState<Restaurant | null>(null);

  // 5. AI 기능 관련 상태
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 카테고리별 이모지 변환 함수
  const getCategoryEmoji = (category: string) => {
    if (category.includes('한식') || category.includes('Korean')) return '🍚';
    if (category.includes('중식') || category.includes('Chinese')) return '🥟';
    if (category.includes('일식') || category.includes('Japanese')) return '🍣';
    if (category.includes('치킨') || category.includes('Chicken')) return '🍗';
    if (category.includes('분식')) return '🍢';
    if (category.includes('카페') || category.includes('Cafe') || category.includes('Coffee')) return '☕';
    if (category.includes('베이커리') || category.includes('Bakery')) return '🥐';
    if (category.includes('술집') || category.includes('Bar')) return '🍺';
    return '🍽️';
  };

  // 위치 권한 요청 함수
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한',
            message: '주변 맛집을 찾으려면 위치 정보가 필요해요.',
            buttonPositive: '확인',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // 현재 위치 가져오기 함수
  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('알림', '위치 권한이 거부되었습니다.');
      return;
    }
    Geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      err => console.error(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // 구글 Places API로 실제 데이터 가져오기
  const fetchRealRestaurants = async (lat: number, lon: number, cat: string) => {
    setIsLoading(true);
    setRestaurants([]);
    setSelectedRestaurant(null);

    try {
      const radius = 2000;
      let keyword = 'restaurant';
      
      // 카테고리별 검색어 설정
      if (cat === '한식') keyword = 'korean_restaurant';
      else if (cat === '중식') keyword = 'chinese_restaurant';
      else if (cat === '일식') keyword = 'japanese_restaurant';
      else if (cat === '치킨') keyword = 'chicken';
      else if (cat === '분식') keyword = 'snackbar';
      else if (cat === '카페') keyword = 'cafe';

      let baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&language=ko&key=${MAPS_API_KEY}`;
      
      if (cat === '전체') {
        baseUrl += `&type=restaurant`;
      } else {
        baseUrl += `&keyword=${keyword}`;
      }

      let allResults: any[] = [];
      
      // 1페이지 요청
      let response = await fetch(baseUrl);
      let json = await response.json();
      
      if (json.status === 'OK') {
        allResults = [...allResults, ...json.results];
      }

      // 페이지네이션 (다음 페이지가 있으면 더 가져오기)
      let nextPageToken = json.next_page_token;
      if (nextPageToken) {
        await new Promise(r => setTimeout(r, 2000)); // 구글 정책상 2초 대기
        const nextUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${nextPageToken}&key=${MAPS_API_KEY}`;
        let res2 = await fetch(nextUrl);
        let json2 = await res2.json();
        
        if (json2.status === 'OK') {
          allResults = [...allResults, ...json2.results];
        }
      }

      // 데이터 정리 (맵핑)
      const mappedData: Restaurant[] = allResults.map((item: any) => {
        let detectedCategory = cat;
        
        if (cat === '전체') {
             if (item.types.includes('cafe')) detectedCategory = '카페';
             else if (item.types.includes('bakery')) detectedCategory = '베이커리';
             else if (item.types.includes('bar')) detectedCategory = '술집';
             else {
                 if (item.name.includes('반점') || item.name.includes('마라')) detectedCategory = '중식';
                 else if (item.name.includes('스시') || item.name.includes('초밥')) detectedCategory = '일식';
                 else if (item.name.includes('치킨')) detectedCategory = '치킨';
                 else detectedCategory = '한식';
             }
        }
        
        return {
          id: item.place_id,
          name: item.name,
          category: detectedCategory,
          lat: item.geometry.location.lat,
          lon: item.geometry.location.lng,
          rating: item.rating || 0,
          reviewCount: item.user_ratings_total || 0,
        };
      });

      // 거리 계산 및 정렬
      const calculatedList = mappedData.map(r => ({
        ...r,
        distance: calculateDistance(lat, lon, r.lat, r.lon)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setRestaurants(calculatedList);

    } catch (e) {
      console.error(e);
      Alert.alert('오류', '데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 룰렛 시작 함수
  const startRoulette = () => {
    if (restaurants.length === 0) {
      Alert.alert('알림', '주변에 식당이 없습니다.');
      return;
    }
    
    setIsRouletteOpen(true);
    setRouletteWinner(null);
    setRouletteText("두근두근...");
    
    let c = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * restaurants.length);
      setRouletteText(restaurants[randomIdx].name);
      c++;
    }, 80);
    
    setTimeout(() => {
      clearInterval(interval);
      const winner = restaurants[Math.floor(Math.random() * restaurants.length)];
      setRouletteWinner(winner);
    }, 2000);
  };

  // 룰렛 결과 처리 함수
  const handleRouletteResult = () => {
    if (rouletteWinner) {
      setSelectedRestaurant(rouletteWinner);
      setViewMode('map');
      setIsRouletteOpen(false);
    }
  };

  // Gemini AI에게 질문하기 함수
  const askGemini = async () => {
    if (!userQuestion.trim()) return;
    
    if (restaurants.length === 0) {
      setAiResponse("주변 식당 데이터가 없습니다. 지도를 먼저 켜주세요!");
      return;
    }

    setIsAiLoading(true);
    setAiResponse("");

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
      
      // 상위 20개 식당 정보만 텍스트로 요약
      const listText = restaurants.slice(0, 20).map(r => 
        `- ${r.name} (${r.category}, 평점 ${r.rating})`
      ).join("\n");
      
      const prompt = `
        주변 식당 목록:
        ${listText}

        사용자 질문: "${userQuestion}"

        이 중에서 가장 적절한 식당 1~2곳을 추천하고 이유를 친절하게 설명해줘.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setAiResponse(text);

    } catch (error) {
      console.error(error);
      setAiResponse("AI 연결에 실패했습니다. 키를 확인해주세요.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // 앱 실행 시 위치 가져오기
  useEffect(() => {
    getLocation();
  }, []);

  // 위치나 카테고리가 바뀌면 데이터 가져오기
  useEffect(() => {
    if (userLocation) {
      fetchRealRestaurants(userLocation.latitude, userLocation.longitude, selectedCategory);
    }
  }, [userLocation, selectedCategory]);

  // 선택된 식당이 바뀌면 지도로 이동
  useEffect(() => {
    if (selectedRestaurant && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: selectedRestaurant.lat,
        longitude: selectedRestaurant.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01
      }, 1000);
    }
  }, [selectedRestaurant, viewMode]);

  // 리스트 아이템 렌더링 함수
  const renderListItem = ({item}: {item: Restaurant}) => (
    <TouchableOpacity 
      style={styles.itemContainer} 
      onPress={() => {
        setSelectedRestaurant(item);
        setViewMode('map');
      }}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemEmoji}>{getCategoryEmoji(item.category)}</Text>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemRating}>
            ⭐ {item.rating} ({item.reviewCount}) • {item.category}
          </Text>
        </View>
      </View>
      <Text style={styles.itemDistance}>{item.distance?.toFixed(2)} km</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. AI 채팅 모달 창 */}
      <Modal visible={isAIOpen} animationType="slide" onRequestClose={() => setIsAIOpen(false)}>
        <SafeAreaView style={styles.aiModalContainer}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>🤖 AI 맛집 비서</Text>
            <TouchableOpacity onPress={() => setIsAIOpen(false)}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.aiContent}>
            {isAiLoading ? (
              <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 50}} />
            ) : (
              <Text style={styles.aiResponseText}>
                {aiResponse || "어떤 음식을 찾으시나요? (예: 비 오는 날 어울리는 곳)"}
              </Text>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              placeholder="질문을 입력하세요" 
              value={userQuestion} 
              onChangeText={setUserQuestion} 
            />
            <TouchableOpacity style={styles.sendButton} onPress={askGemini}>
              <Text style={styles.sendButtonText}>전송</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* 2. 룰렛 모달 창 */}
      <Modal visible={isRouletteOpen} transparent={true} onRequestClose={() => setIsRouletteOpen(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🎲 룰렛 결과</Text>
            <Text style={styles.rouletteText}>
              {rouletteWinner ? rouletteWinner.name : rouletteText}
            </Text>
            {rouletteWinner && (
              <TouchableOpacity style={styles.modalButton} onPress={handleRouletteResult}>
                <Text style={styles.modalButtonText}>여기 갈래요!</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* 3. 상단 카테고리 필터 */}
      <View style={styles.topContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.categoryButton, selectedCategory === cat && styles.selectedButton]} 
              onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedText]}>
                {getCategoryEmoji(cat)} {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 4. 메인 화면 (지도 또는 리스트) */}
      {!userLocation ? (
        <View style={styles.loadingContainer}><Text>위치 찾는 중...</Text></View>
      ) : viewMode === 'map' ? (
        <MapView 
          ref={mapRef} 
          provider={PROVIDER_GOOGLE} 
          style={styles.map} 
          region={{
            latitude: userLocation.latitude, 
            longitude: userLocation.longitude, 
            latitudeDelta: 0.015, 
            longitudeDelta: 0.015
          }} 
          showsUserLocation={true} 
          showsMyLocationButton={true}
        >
          {selectedRestaurant && (
            <MapViewDirections 
              origin={userLocation} 
              destination={{latitude: selectedRestaurant.lat, longitude: selectedRestaurant.lon}} 
              apikey={MAPS_API_KEY} 
              mode="WALKING" 
              strokeWidth={5} 
              strokeColor="#007AFF" 
            />
          )}
          
          {restaurants.map(r => (
            <Marker 
              key={r.id} 
              coordinate={{latitude: r.lat, longitude: r.lon}} 
              title={r.name} 
              onPress={() => setSelectedRestaurant(r)} 
              pinColor={selectedRestaurant?.id === r.id ? 'green' : 'red'}
            >
               <View style={[styles.customMarker, selectedRestaurant?.id === r.id && styles.selectedMarker]}>
                <Text style={styles.markerEmoji}>{getCategoryEmoji(r.category)}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={styles.listContainer}>
          <FlatList 
            data={restaurants} 
            keyExtractor={item => item.id} 
            renderItem={renderListItem} 
          />
        </View>
      )}

      {/* 5. 하단 버튼 영역 */}
      <View style={styles.bottomContainer}>
        <Text style={styles.infoText}>
          {selectedRestaurant ? `[선택] ${selectedRestaurant.name}` : `주변 ${restaurants.length}곳 발견`}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#6c757d'}]} onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}>
            <Text style={styles.buttonText}>{viewMode === 'map' ? '📄 목록' : '🗺️ 지도'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#FF9500'}]} onPress={startRoulette}>
            <Text style={styles.buttonText}>🎲 룰렛</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#5856D6'}]} onPress={() => setIsAIOpen(true)}>
            <Text style={styles.buttonText}>🤖 AI</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  topContainer: {height: 60, padding: 10, backgroundColor: 'white', elevation: 5},
  categoryButton: {padding: 10, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 8, justifyContent: 'center'},
  selectedButton: {backgroundColor: '#007AFF'},
  categoryText: {color: '#333'}, selectedText: {color: '#fff'},
  map: {flex: 1}, listContainer: {flex: 1, padding: 20},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  bottomContainer: {padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#eee'},
  infoText: {marginBottom: 10, textAlign: 'center'},
  buttonRow: {flexDirection: 'row', justifyContent: 'space-between'},
  actionButton: {flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 2},
  buttonText: {color: 'white', fontWeight: 'bold'},
  itemContainer: {padding: 15, marginBottom: 10, backgroundColor: '#f8f9fa', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between'},
  itemInfo: {flexDirection: 'row', alignItems: 'center'},
  itemEmoji: {fontSize: 24, marginRight: 10},
  itemName: {fontWeight: 'bold', fontSize: 16},
  itemRating: {color: 'orange', fontSize: 12},
  itemDistance: {fontWeight: 'bold', color: '#007AFF'},
  customMarker: {backgroundColor: 'white', padding: 5, borderRadius: 15, borderWidth: 1, borderColor: '#ddd'},
  selectedMarker: {borderColor: '#007AFF', borderWidth: 2, transform: [{scale: 1.2}]},
  markerEmoji: {fontSize: 18},
  modalBackground: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'},
  modalContainer: {width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center'},
  modalTitle: {fontSize: 20, fontWeight: 'bold', marginBottom: 15},
  rouletteText: {fontSize: 22, marginVertical: 20},
  modalButton: {marginTop: 10, backgroundColor: '#007AFF', padding: 10, borderRadius: 10},
  modalButtonText: {color: 'white'},
  aiModalContainer: {flex: 1, backgroundColor: '#f5f5f5'},
  aiHeader: {padding: 20, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3},
  aiTitle: {fontSize: 20, fontWeight: 'bold'},
  closeText: {fontSize: 16, color: '#007AFF'},
  aiContent: {flex: 1, padding: 20},
  aiResponseText: {fontSize: 16, lineHeight: 24, color: '#333'},
  inputContainer: {padding: 15, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center'},
  textInput: {flex: 1, height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 20, backgroundColor: '#f9f9f9'},
  sendButton: {marginLeft: 10, backgroundColor: '#5856D6', padding: 15, borderRadius: 25},
  sendButtonText: {color: 'white', fontWeight: 'bold'},
});

export default App;