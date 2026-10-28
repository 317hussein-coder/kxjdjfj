#pragma once

#include <QQuickFramebufferObject>
#include <QPointer>
#include "playercore.h"

class MpvRenderItem final : public QQuickFramebufferObject
{
    Q_OBJECT
    Q_PROPERTY(PlayerCore* player READ player WRITE setPlayer NOTIFY playerChanged)
public:
    explicit MpvRenderItem(QQuickItem *parent = nullptr);
    Renderer *createRenderer() const override;
    PlayerCore *player() const { return m_player; }
    void setPlayer(PlayerCore *player);

signals:
    void playerChanged();

private:
    QPointer<PlayerCore> m_player;
};
