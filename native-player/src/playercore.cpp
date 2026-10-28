#include "playercore.h"

#include <QUrl>
#include <QDebug>
#include <QByteArray>
#include <QStringList>
#include <vector>

PlayerCore::PlayerCore(QObject *parent) : QObject(parent)
{
    m_mpv = mpv_create();
    if (!m_mpv) {
        setError(QStringLiteral("تعذّر إنشاء محرك libmpv."));
        return;
    }

    mpv_set_option_string(m_mpv, "vo", "libmpv");
    mpv_set_option_string(m_mpv, "terminal", "no");
    mpv_set_option_string(m_mpv, "input-default-bindings", "no");
    mpv_set_option_string(m_mpv, "input-vo-keyboard", "no");
    mpv_set_option_string(m_mpv, "hwdec", "auto-safe");
    mpv_set_option_string(m_mpv, "sub-auto", "fuzzy");
    mpv_set_option_string(m_mpv, "alang", "ar,ara,en");
    mpv_set_option_string(m_mpv, "slang", "ar,ara,en");
    mpv_set_option_string(m_mpv, "keep-open", "yes");
    mpv_set_option_string(m_mpv, "ytdl", "yes");
    mpv_set_option_string(m_mpv, "cache", "yes");
    mpv_set_option_string(m_mpv, "demuxer-readahead-secs", "20");
    mpv_set_option_string(m_mpv, "demuxer-max-bytes", "150MiB");

    const int result = mpv_initialize(m_mpv);
    if (result < 0) {
        setError(QStringLiteral("فشل تهيئة libmpv: %1").arg(QString::fromUtf8(mpv_error_string(result))));
        mpv_terminate_destroy(m_mpv);
        m_mpv = nullptr;
        return;
    }

    m_ready = true;
    mpv_observe_property(m_mpv, 1, "pause", MPV_FORMAT_FLAG);
    mpv_observe_property(m_mpv, 2, "time-pos", MPV_FORMAT_DOUBLE);
    mpv_observe_property(m_mpv, 3, "duration", MPV_FORMAT_DOUBLE);
    mpv_observe_property(m_mpv, 4, "media-title", MPV_FORMAT_STRING);
    mpv_observe_property(m_mpv, 5, "volume", MPV_FORMAT_DOUBLE);
    mpv_observe_property(m_mpv, 6, "speed", MPV_FORMAT_DOUBLE);
    emit readyChanged();
}

PlayerCore::~PlayerCore()
{
    if (m_mpv)
        mpv_terminate_destroy(m_mpv);
}

bool PlayerCore::command(const QVariantList &args)
{
    if (!m_mpv || args.isEmpty())
        return false;
    std::vector<QByteArray> encoded;
    encoded.reserve(static_cast<size_t>(args.size()));
    for (const QVariant &arg : args)
        encoded.push_back(arg.toString().toUtf8());
    std::vector<const char *> cargs;
    cargs.reserve(encoded.size() + 1);
    for (const QByteArray &arg : encoded)
        cargs.push_back(arg.constData());
    cargs.push_back(nullptr);
    const int result = mpv_command(m_mpv, cargs.data());
    if (result < 0) {
        setError(QString::fromUtf8(mpv_error_string(result)));
        return false;
    }
    return true;
}

bool PlayerCore::open(const QUrl &url)
{
    if (!m_ready || !url.isValid() || url.isEmpty()) {
        setError(QStringLiteral("اختر ملف فيديو أو رابطًا صالحًا."));
        return false;
    }
    const QString target = url.isLocalFile() ? url.toLocalFile() : url.toString(QUrl::FullyEncoded);
    m_error.clear();
    emit errorChanged();
    return command({QStringLiteral("loadfile"), target, QStringLiteral("replace")});
}

void PlayerCore::togglePause() { command({QStringLiteral("cycle"), QStringLiteral("pause")}); }
void PlayerCore::seekRelative(double seconds) {
    command({QStringLiteral("seek"), QString::number(seconds, 'f', 3), QStringLiteral("relative+exact")});
}
void PlayerCore::seekAbsolute(double seconds) {
    command({QStringLiteral("seek"), QString::number(qMax(0.0, seconds), 'f', 3), QStringLiteral("absolute+exact")});
}
void PlayerCore::stop() { command({QStringLiteral("stop")}); }

void PlayerCore::setSubtitleFile(const QUrl &url)
{
    if (url.isValid() && !url.isEmpty())
        command({QStringLiteral("sub-add"), url.isLocalFile() ? url.toLocalFile() : url.toString(QUrl::FullyEncoded), QStringLiteral("select")});
}

void PlayerCore::cycleAudioTrack() { command({QStringLiteral("cycle"), QStringLiteral("audio")}); }
void PlayerCore::cycleSubtitleTrack() { command({QStringLiteral("cycle"), QStringLiteral("sub")}); }

void PlayerCore::setVolume(double value)
{
    m_volume = qBound(0.0, value, 150.0);
    command({QStringLiteral("set"), QStringLiteral("volume"), QString::number(m_volume)});
    emit volumeChanged();
}

void PlayerCore::setSpeed(double value)
{
    m_speed = qBound(0.25, value, 4.0);
    command({QStringLiteral("set"), QStringLiteral("speed"), QString::number(m_speed, 'f', 2)});
    emit speedChanged();
}

void PlayerCore::action(const QString &name)
{
    if (name == QStringLiteral("mute")) command({QStringLiteral("cycle"), QStringLiteral("mute")});
    else if (name == QStringLiteral("screenshot")) command({QStringLiteral("screenshot"), QStringLiteral("video")});
    else if (name == QStringLiteral("screenshot-subtitles")) command({QStringLiteral("screenshot"), QStringLiteral("subtitles")});
    else if (name == QStringLiteral("aspect-auto")) command({QStringLiteral("set"), QStringLiteral("video-aspect-override"), QStringLiteral("no")});
    else if (name == QStringLiteral("aspect-16-9")) command({QStringLiteral("set"), QStringLiteral("video-aspect-override"), QStringLiteral("16:9")});
    else if (name == QStringLiteral("aspect-4-3")) command({QStringLiteral("set"), QStringLiteral("video-aspect-override"), QStringLiteral("4:3")});
    else if (name == QStringLiteral("rotate")) command({QStringLiteral("cycle-values"), QStringLiteral("video-rotate"), QStringLiteral("0"), QStringLiteral("90"), QStringLiteral("180"), QStringLiteral("270")});
    else if (name == QStringLiteral("deinterlace")) command({QStringLiteral("cycle"), QStringLiteral("deinterlace")});
    else if (name == QStringLiteral("loop")) command({QStringLiteral("cycle-values"), QStringLiteral("loop-file"), QStringLiteral("inf"), QStringLiteral("no")});
    else if (name == QStringLiteral("next")) command({QStringLiteral("playlist-next"), QStringLiteral("weak")});
    else if (name == QStringLiteral("previous")) command({QStringLiteral("playlist-prev"), QStringLiteral("weak")});
    else if (name == QStringLiteral("frame-forward")) command({QStringLiteral("frame-step")});
    else if (name == QStringLiteral("frame-back")) command({QStringLiteral("frame-back-step")});
    else if (name == QStringLiteral("subtitle-delay-plus")) adjust(QStringLiteral("sub-delay"), 0.25);
    else if (name == QStringLiteral("subtitle-delay-minus")) adjust(QStringLiteral("sub-delay"), -0.25);
    else if (name == QStringLiteral("audio-delay-plus")) adjust(QStringLiteral("audio-delay"), 0.1);
    else if (name == QStringLiteral("audio-delay-minus")) adjust(QStringLiteral("audio-delay"), -0.1);
    else if (name == QStringLiteral("subtitle-size-plus")) adjust(QStringLiteral("sub-scale"), 0.1);
    else if (name == QStringLiteral("subtitle-size-minus")) adjust(QStringLiteral("sub-scale"), -0.1);
    else if (name == QStringLiteral("subtitle-up")) adjust(QStringLiteral("sub-pos"), -2);
    else if (name == QStringLiteral("subtitle-down")) adjust(QStringLiteral("sub-pos"), 2);
    else if (name == QStringLiteral("brightness-plus")) adjust(QStringLiteral("brightness"), 5);
    else if (name == QStringLiteral("brightness-minus")) adjust(QStringLiteral("brightness"), -5);
    else if (name == QStringLiteral("contrast-plus")) adjust(QStringLiteral("contrast"), 5);
    else if (name == QStringLiteral("contrast-minus")) adjust(QStringLiteral("contrast"), -5);
    else if (name == QStringLiteral("saturation-plus")) adjust(QStringLiteral("saturation"), 5);
    else if (name == QStringLiteral("saturation-minus")) adjust(QStringLiteral("saturation"), -5);
    else if (name == QStringLiteral("gamma-plus")) adjust(QStringLiteral("gamma"), 5);
    else if (name == QStringLiteral("gamma-minus")) adjust(QStringLiteral("gamma"), -5);
    else if (name == QStringLiteral("reset-picture")) {
        command({QStringLiteral("set"), QStringLiteral("brightness"), QStringLiteral("0")});
        command({QStringLiteral("set"), QStringLiteral("contrast"), QStringLiteral("0")});
        command({QStringLiteral("set"), QStringLiteral("saturation"), QStringLiteral("0")});
        command({QStringLiteral("set"), QStringLiteral("gamma"), QStringLiteral("0")});
        command({QStringLiteral("set"), QStringLiteral("video-rotate"), QStringLiteral("0")});
        command({QStringLiteral("set"), QStringLiteral("video-aspect-override"), QStringLiteral("no")});
    }
    else if (name == QStringLiteral("zoom-in")) adjust(QStringLiteral("video-zoom"), 0.1);
    else if (name == QStringLiteral("zoom-out")) adjust(QStringLiteral("video-zoom"), -0.1);
    else if (name == QStringLiteral("pan-left")) adjust(QStringLiteral("video-pan-x"), -0.05);
    else if (name == QStringLiteral("pan-right")) adjust(QStringLiteral("video-pan-x"), 0.05);
    else if (name == QStringLiteral("pan-up")) adjust(QStringLiteral("video-pan-y"), -0.05);
    else if (name == QStringLiteral("pan-down")) adjust(QStringLiteral("video-pan-y"), 0.05);
    else if (name == QStringLiteral("reset-zoom")) {
        command({QStringLiteral("set"), QStringLiteral("video-zoom"), QStringLiteral("0")});
        command({QStringLiteral("set"), QStringLiteral("video-pan-x"), QStringLiteral("0")});
        command({QStringLiteral("set"), QStringLiteral("video-pan-y"), QStringLiteral("0")});
    }
}

void PlayerCore::adjust(const QString &property, double delta)
{
    static const QStringList allowed = {
        QStringLiteral("sub-delay"), QStringLiteral("audio-delay"), QStringLiteral("sub-scale"),
        QStringLiteral("sub-pos"), QStringLiteral("brightness"), QStringLiteral("contrast"),
        QStringLiteral("saturation"), QStringLiteral("gamma"), QStringLiteral("video-zoom"),
        QStringLiteral("video-pan-x"), QStringLiteral("video-pan-y")
    };
    if (!allowed.contains(property))
        return;
    command({QStringLiteral("add"), property, QString::number(delta, 'f', 3)});
}

void PlayerCore::setError(const QString &message)
{
    m_error = message;
    emit errorChanged();
}

void PlayerCore::pollEvents()
{
    if (!m_mpv)
        return;
    while (mpv_event *event = mpv_wait_event(m_mpv, 0)) {
        if (event->event_id == MPV_EVENT_NONE)
            break;
        if (event->event_id == MPV_EVENT_SHUTDOWN)
            break;
        if (event->event_id == MPV_EVENT_PROPERTY_CHANGE) {
            auto *property = static_cast<mpv_event_property *>(event->data);
            if (!property || !property->name)
                continue;
            const QString name = QString::fromUtf8(property->name);
            if (name == QStringLiteral("pause") && property->format == MPV_FORMAT_FLAG && property->data) {
                const bool paused = *static_cast<int *>(property->data) != 0;
                if (m_playing != !paused) { m_playing = !paused; emit playingChanged(); }
            } else if (name == QStringLiteral("time-pos") && property->format == MPV_FORMAT_DOUBLE && property->data) {
                m_position = *static_cast<double *>(property->data); emit positionChanged();
            } else if (name == QStringLiteral("duration") && property->format == MPV_FORMAT_DOUBLE && property->data) {
                m_duration = *static_cast<double *>(property->data); emit durationChanged();
            } else if (name == QStringLiteral("media-title") && property->format == MPV_FORMAT_STRING && property->data) {
                m_mediaTitle = QString::fromUtf8(*static_cast<char **>(property->data)); emit mediaTitleChanged();
            } else if (name == QStringLiteral("volume") && property->format == MPV_FORMAT_DOUBLE && property->data) {
                m_volume = *static_cast<double *>(property->data); emit volumeChanged();
            } else if (name == QStringLiteral("speed") && property->format == MPV_FORMAT_DOUBLE && property->data) {
                m_speed = *static_cast<double *>(property->data); emit speedChanged();
            }
        } else if (event->event_id == MPV_EVENT_END_FILE) {
            auto *end = static_cast<mpv_event_end_file *>(event->data);
            if (end && end->reason == MPV_END_FILE_REASON_ERROR)
                setError(QStringLiteral("تعذّر تشغيل هذا الملف أو أن ترميزه غير مدعوم."));
        }
    }
    emit renderUpdateRequested();
}
