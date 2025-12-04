# 푸드팟
---
내 주변 음식점 찾기 어플입니다.
### 📖 프로젝트 소개
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

  <img src="https://github.com/user-attachments/assets/1b3472f1-9a0a-4385-9c2f-3acf23533ee0" width="200">

  앱을 실행 시키면 나오는 화면입니다. open ai를 통해 구글 맵과 음식점의 정보, GPS를 사용한 나의 위치를 불러왔습니다.

  이곳에서 나의 현재 위치와 상단의 음식점 카테고리, 하단의 목록, 룰렛, AI 등

  다양한 기능을 사용 할 수 있습니다.

+ **카테고리 사용**

  <img src="https://github.com/user-attachments/assets/9d15bdb6-cfef-41b2-9c04-dfab48bf4365" width="200"> <img src="https://github.com/user-attachments/assets/d31603c8-f4c7-4f7d-b36b-272fec5875f5" width="200">

  카테고리 기능 활용입니다. 상단의 한식, 중식, 일식, 치킨 등의 카테고리를 클릭하면

  카테고리에 맞는 음식점이 지도위에 표시됩니다. 각 카테고리에 알맞는 이모지로 표시됩니다.

  이모지를 클릭하면 그 음식점의 정보와 별점을 확인 할 수 있습니다.

+ **리스트로 보기**

  <img src="https://github.com/user-attachments/assets/8666416f-59a6-405e-aa28-cb667ad4d03e" width="200">

  하단의 목록 버튼을 클릭 시 지도와 마커로 표시되던 음식점들이 간단한 리스트로 거리가 가가운 순으로 출력됩니다.

  지도 버튼을 눌러 다시 지도형으로 변경이 가능합니다.
  
+ **랜덤 추천**

  <img src="https://github.com/user-attachments/assets/572c48de-7bb0-4105-8d18-9fa2bd3e91b7" width="200"> <img src="https://github.com/user-attachments/assets/9fed1c00-68e0-48dd-8292-25be19d62106" width="200">

 하단 중앙의 룰렛 버튼을 클릭 시 검색된 음식점 안에서 근처 음식점 중 무작위로 한 가지를 출력합니다.

 여기 갈래요! 버튼을 누르면 해당 음식점이 중앙으로 오도록 부드럽게 포커싱합니다.

 + **AI 맛집 비서**

  <img src="https://github.com/user-attachments/assets/4abe174a-2abf-43b1-8d74-c8e48fdec3bb" width="200">

  Gemini OpenAI를 통해 구현했습니다.

 하단 우측의 AI 버튼을 클릭 시 ai 채팅방으로 넘어갑니다. 여기서 ai에게 질문을 해 음식점 추천을 받을 수 있습니다.
***
  
### 📷 동작 영상

여기에 영상 삽입

앱의 실행 영상입니다.  
