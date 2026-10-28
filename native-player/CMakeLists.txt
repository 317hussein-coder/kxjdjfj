cmake_minimum_required(VERSION 3.21)
project(TatbiqYaiNative VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 6.8 REQUIRED COMPONENTS Core Gui Qml Quick QuickControls2)

# CI supplies the matching libmpv headers and Android shared libraries.
set(MPV_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/third_party/mpv" CACHE PATH "libmpv Android package root")
find_path(MPV_INCLUDE_DIR mpv/client.h PATHS "${MPV_ROOT}/include" NO_DEFAULT_PATH)
find_library(MPV_LIBRARY NAMES mpv libmpv PATHS "${MPV_ROOT}/lib/${ANDROID_ABI}" NO_DEFAULT_PATH)

if(NOT MPV_INCLUDE_DIR OR NOT MPV_LIBRARY)
  message(FATAL_ERROR
    "libmpv for ${ANDROID_ABI} was not found. Expected ${MPV_ROOT}/include/mpv/client.h and ${MPV_ROOT}/lib/${ANDROID_ABI}/libmpv.so. "
    "Do not replace it with a host library; build/download a matching Android NDK binary first.")
endif()

qt_add_executable(tatbiqyai-native
  src/main.cpp
  src/playercore.cpp
  src/playercore.h
  src/mpvrenderitem.cpp
  src/mpvrenderitem.h
  qml.qrc
)

target_include_directories(tatbiqyai-native PRIVATE "${MPV_INCLUDE_DIR}")
target_link_libraries(tatbiqyai-native PRIVATE
  Qt6::Core Qt6::Gui Qt6::Qml Qt6::Quick Qt6::QuickControls2 "${MPV_LIBRARY}"
)

qt_add_resources(tatbiqyai-native "qml_resources"
  PREFIX "/"
  FILES qml/Main.qml
)

set_target_properties(tatbiqyai-native PROPERTIES
  QT_ANDROID_PACKAGE_SOURCE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/android"
  QT_ANDROID_PACKAGE_NAME "com.tatbiqyai.nativeplayer"
  QT_ANDROID_APP_NAME "تطبيقياي فيديو ناتيف"
  QT_ANDROID_MIN_SDK_VERSION 26
  QT_ANDROID_TARGET_SDK_VERSION 35
)
