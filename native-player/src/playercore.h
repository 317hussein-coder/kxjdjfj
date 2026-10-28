#pragma once

#include <QObject>
#include <QString>
#include <QVariant>
#include <QUrl>
#include <mpv/client.h>

class PlayerCore final : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool ready READ ready NOTIFY readyChanged)
    Q_PROPERTY(bool playing READ playing NOTIFY playingChanged)
    Q_PROPERTY(QString mediaTitle READ mediaTitle NOTIFY mediaTitleChanged)
    Q_PROPERTY(QString errorString READ errorString NOTIFY errorChanged)
    Q_PROPERTY(double position READ position NOTIFY positionChanged)
    Q_PROPERTY(double duration READ duration NOTIFY durationChanged)
    Q_PROPERTY(double volume READ volume WRITE setVolume NOTIFY volumeChanged)
    Q_PROPERTY(double speed READ speed WRITE setSpeed NOTIFY speedChanged)

public:
    explicit PlayerCore(QObject *parent = nullptr);
    ~PlayerCore() override;

    bool ready() const { return m_ready; }
    bool playing() const { return m_playing; }
    QString mediaTitle() const { return m_mediaTitle; }
    QString errorString() const { return m_error; }
    double position() const { return m_position; }
    double duration() const { return m_duration; }
    double volume() const { return m_volume; }
    double speed() const { return m_speed; }
    mpv_handle *handle() const { return m_mpv; }

    Q_INVOKABLE bool open(const QUrl &url);
    Q_INVOKABLE void togglePause();
    Q_INVOKABLE void seekRelative(double seconds);
    Q_INVOKABLE void seekAbsolute(double seconds);
    Q_INVOKABLE void stop();
    Q_INVOKABLE void setSubtitleFile(const QUrl &url);
    Q_INVOKABLE void cycleAudioTrack();
    Q_INVOKABLE void cycleSubtitleTrack();
    Q_INVOKABLE void setVolume(double value);
    Q_INVOKABLE void setSpeed(double value);
    Q_INVOKABLE void pollEvents();
    Q_INVOKABLE void action(const QString &name);
    Q_INVOKABLE void adjust(const QString &property, double delta);

signals:
    void readyChanged();
    void playingChanged();
    void mediaTitleChanged();
    void errorChanged();
    void positionChanged();
    void durationChanged();
    void volumeChanged();
    void speedChanged();
    void renderUpdateRequested();

private:
    bool command(const QVariantList &args);
    void setError(const QString &message);
    mpv_handle *m_mpv = nullptr;
    bool m_ready = false;
    bool m_playing = false;
    QString m_mediaTitle;
    QString m_error;
    double m_position = 0.0;
    double m_duration = 0.0;
    double m_volume = 100.0;
    double m_speed = 1.0;
};
