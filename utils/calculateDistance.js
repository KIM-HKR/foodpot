// 두 지점 간의 거리를 km 단위로 계산하는 하버사인(Haversine) 공식
function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구의 반지름 (단위: km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // 최종 거리 (km)
    return distance;
  }
  
  // 도(degree) 단위를 라디안(radian) 단위로 변환
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  
  // 이 함수를 다른 파일(예: App.js)에서 가져다 쓸 수 있도록 내보내기(export)
  export default getDistanceInKm;