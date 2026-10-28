#include <android_native_app_glue.h>
#include <android/log.h>
#include <android/native_window.h>
#include <NdkMediaPlayer.h>
#include <jni.h>
#include <string>

#define LOG_TAG "MyMediaSee"
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

struct State {
    android_app* app = nullptr;
    AMediaPlayer* player = nullptr;
    ANativeWindow* window = nullptr;
    bool playing = false;
    bool prepared = false;
    std::string source;
};

static std::string intentData(android_app* app) {
    if (!app || !app->activity || !app->activity->vm || !app->activity->clazz) return {};
    JavaVM* vm = app->activity->vm;
    JNIEnv* env = nullptr;
    bool attached = false;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        if (vm->AttachCurrentThread(&env, nullptr) != JNI_OK) return {};
        attached = true;
    }
    std::string result;
    jclass activityClass = env->GetObjectClass(app->activity->clazz);
    jmethodID getIntent = env->GetMethodID(activityClass, "getIntent", "()Landroid/content/Intent;");
    jobject intent = getIntent ? env->CallObjectMethod(app->activity->clazz, getIntent) : nullptr;
    if (intent) {
        jclass intentClass = env->GetObjectClass(intent);
        jmethodID getData = env->GetMethodID(intentClass, "getData", "()Landroid/net/Uri;");
        jobject uri = getData ? env->CallObjectMethod(intent, getData) : nullptr;
        if (uri) {
            jclass uriClass = env->GetObjectClass(uri);
            jmethodID toString = env->GetMethodID(uriClass, "toString", "()Ljava/lang/String;");
            auto str = static_cast<jstring>(toString ? env->CallObjectMethod(uri, toString) : nullptr);
            if (str) {
                const char* chars = env->GetStringUTFChars(str, nullptr);
                if (chars) { result.assign(chars); env->ReleaseStringUTFChars(str, chars); }
                env->DeleteLocalRef(str);
            }
            env->DeleteLocalRef(uri);
            env->DeleteLocalRef(uriClass);
        }
        env->DeleteLocalRef(intent);
        env->DeleteLocalRef(intentClass);
    }
    env->DeleteLocalRef(activityClass);
    if (attached) vm->DetachCurrentThread();
    return result;
}

static void stopPlayer(State* s) {
    if (s->player) {
        AMediaPlayer_setListener(s->player, nullptr, nullptr);
        AMediaPlayer_stop(s->player);
        AMediaPlayer_setSurface(s->player, nullptr);
        AMediaPlayer_delete(s->player);
        s->player = nullptr;
    }
    s->prepared = false;
    s->playing = false;
}

static void playerEvent(AMediaPlayer* player, void* user, media_player_states event, int32_t, int32_t) {
    auto* s = static_cast<State*>(user);
    if (!s) return;
    if (event == MEDIA_PLAYER_PREPARED) {
        s->prepared = true;
        if (s->window) AMediaPlayer_setSurface(player, s->window);
        const auto result = AMediaPlayer_start(player);
        s->playing = result == AMEDIA_OK;
        LOGI("Prepared media; start status=%d", static_cast<int>(result));
    } else if (event == MEDIA_PLAYER_PLAYBACK_COMPLETE) {
        s->playing = false;
        LOGI("Playback completed");
    } else if (event == MEDIA_PLAYER_ERROR) {
        s->playing = false;
        LOGE("Media playback error");
    }
}

static void startSource(State* s, const std::string& uri) {
    stopPlayer(s);
    s->source = uri;
    if (uri.empty()) {
        LOGI("Open a direct HTTP/HTTPS media URL with Android Open with / Share to MY MEDIA SEE.");
        return;
    }
    s->player = AMediaPlayer_new();
    if (!s->player) { LOGE("AMediaPlayer_new failed"); return; }
    if (s->window) AMediaPlayer_setSurface(s->player, s->window);
    AMediaPlayer_setListener(s->player, playerEvent, s);
    media_status_t status = AMediaPlayer_setDataSource(s->player, uri.c_str());
    if (status != AMEDIA_OK) {
        LOGE("setDataSource failed: %d", static_cast<int>(status));
        stopPlayer(s);
        return;
    }
    status = AMediaPlayer_prepareAsync(s->player);
    if (status != AMEDIA_OK) {
        LOGE("prepareAsync failed: %d", static_cast<int>(status));
        stopPlayer(s);
    } else {
        LOGI("Preparing URI");
    }
}

static void onCmd(android_app* app, int32_t cmd) {
    auto* s = static_cast<State*>(app->userData);
    if (!s) return;
    if (cmd == APP_CMD_INIT_WINDOW && app->window) {
        s->window = app->window;
        if (s->source.empty()) s->source = intentData(app);
        if (!s->source.empty()) startSource(s, s->source);
    } else if (cmd == APP_CMD_TERM_WINDOW) {
        s->window = nullptr;
        if (s->player) AMediaPlayer_setSurface(s->player, nullptr);
    } else if (cmd == APP_CMD_DESTROY) {
        stopPlayer(s);
    }
}

static int32_t onInput(android_app* app, AInputEvent* event) {
    auto* s = static_cast<State*>(app->userData);
    if (!s || AInputEvent_getType(event) != AINPUT_EVENT_TYPE_MOTION) return 0;
    if (AMotionEvent_getAction(event) == AMOTION_EVENT_ACTION_UP && s->player && s->prepared) {
        if (s->playing) {
            AMediaPlayer_pause(s->player);
            s->playing = false;
        } else {
            s->playing = AMediaPlayer_start(s->player) == AMEDIA_OK;
        }
        return 1;
    }
    return 0;
}

void android_main(android_app* app) {
    app_dummy();
    State state;
    state.app = app;
    app->userData = &state;
    app->onAppCmd = onCmd;
    app->onInputEvent = onInput;
    while (!app->destroyRequested) {
        int events = 0;
        android_poll_source* source = nullptr;
        const int timeout = state.player ? 100 : -1;
        int ident = ALooper_pollOnce(timeout, nullptr, &events, reinterpret_cast<void**>(&source));
        while (ident >= 0) {
            if (source) source->process(app, source);
            if (app->destroyRequested) break;
            ident = ALooper_pollOnce(0, nullptr, &events, reinterpret_cast<void**>(&source));
        }
    }
    stopPlayer(&state);
}
