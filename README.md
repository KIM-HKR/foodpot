# 푸드팟
---
내 주변 음식점 찾기 어플 푸드팟(FoodPot) 입니다.
### 📖 프로젝트 소개
바이브 코딩 방식으로 진행해

AI 에이전트를 사용해서 음식점 검색 어플을 제작했습니다.


***
### ⚙️ 개발 환경
window
### 🔨 개발 도구
**tools:** Cursor

**programming language:** React Native

**AI agent:** Gemini, Cursor 내장 ai

**초기 식당 정보:** JSON

**Open API:** 

### Google Maps Platform

- Maps SDK for Android

- Places API

- Directions API

### Google AI Studio

- Gemini API

https://developers.google.com/maps/documentation

https://developers.google.com/maps/documentation/places/web-service/search-nearby

https://developers.google.com/maps/documentation/directions/overview

https://ai.google.dev/gemini-api/docs

***
### 기능 소개


+ **메인 화면:** 음식점 위치 나열

  <img  src="https://github.com/user-attachments/assets/bee10fa3-348e-4afe-bd5d-9aab897f0170" width="200">

  앱을 실행 시키면 나오는 화면입니다. open ai를 통해 구글 맵과 음식점의 정보, GPS를 사용한 나의 위치를 불러왔습니다.

  이곳에서 나의 현재 위치와 상단의 음식점 카테고리, 하단의 목록, 룰렛, AI 등

  다양한 기능을 사용 할 수 있습니다.

+ **카테고리 사용**

  <img src="https://github.com/user-attachments/assets/abfa4288-bd26-4e35-bfce-3b44357174f1" width="200"> <img src="https://github.com/user-attachments/assets/062b9f78-f598-481e-b5ba-a7071aeb3e0b" width="200">

  카테고리 기능 활용입니다. 상단의 한식, 중식, 일식, 치킨 등의 카테고리를 클릭하면

  카테고리에 맞는 음식점이 지도위에 표시됩니다. 각 카테고리에 알맞는 이모지로 표시됩니다.

  이모지를 클릭하면 그 음식점의 정보와 별점을 확인 할 수 있습니다.

+ **리스트로 보기**

  <img  src="https://github.com/user-attachments/assets/b6cabbf8-9e2a-43c6-a733-9678f0a6e03a" width="200">

  하단의 목록 버튼을 클릭 시 지도와 마커로 표시되던 음식점들이 간단한 리스트로 거리가 가가운 순으로 출력됩니다.

  지도 버튼을 눌러 다시 지도형으로 변경이 가능합니다.
  
+ **랜덤 추천**

  <img src="https://github.com/user-attachments/assets/3c43e41c-0235-440f-8688-5cb62b9d6202" width="200"> <img src="https://github.com/user-attachments/assets/e6671def-3ff1-4db4-b9e7-87d8c30e7022" width="200">

 하단 중앙의 룰렛 버튼을 클릭 시 검색된 음식점 안에서 근처 음식점 중 무작위로 한 가지를 출력합니다.

 여기 갈래요! 버튼을 누르면 해당 음식점이 중앙으로 오도록 부드럽게 포커싱합니다.

 + **AI 맛집 비서**

  <img src="https://github.com/user-attachments/assets/efb278d9-65ac-4de2-a399-2be4eabc8b53" width="200">

  Gemini OpenAI를 통해 구현했습니다.

 하단 우측의 AI 버튼을 클릭 시 ai 채팅방으로 넘어갑니다. 여기서 ai에게 질문을 해 음식점 추천을 받을 수 있습니다.
***

### 📷 동작 영상

https://github.com/user-attachments/assets/f774312b-b4a6-4840-ba8a-a223b16970bc


앱의 실행 영상입니다.  
