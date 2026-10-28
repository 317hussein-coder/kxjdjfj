#include "mpvrenderitem.h"

#include <QOpenGLFramebufferObject>
#include <QOpenGLContext>
#include <QQuickWindow>
#include <QMetaObject>
#include <QDebug>
#include <mpv/render_gl.h>

static void *mpvGetProcAddress(void *ctx, const char *name)
{
    Q_UNUSED(ctx);
    QOpenGLContext *gl = QOpenGLContext::currentContext();
    if (!gl)
        return nullptr;
    return reinterpret_cast<void *>(gl->getProcAddress(QByteArray(name)));
}

class MpvRenderer final : public QQuickFramebufferObject::Renderer
{
public:
    ~MpvRenderer() override
    {
        if (m_context)
            mpv_render_context_free(m_context);
    }

    QOpenGLFramebufferObject *createFramebufferObject(const QSize &size) override
    {
        QOpenGLFramebufferObjectFormat format;
        format.setAttachment(QOpenGLFramebufferObject::CombinedDepthStencil);
        format.setSamples(0);
        return new QOpenGLFramebufferObject(size, format);
    }

    void synchronize(QQuickFramebufferObject *item) override
    {
        auto *video = static_cast<MpvRenderItem *>(item);
        PlayerCore *player = video->player();
        if (player != m_player) {
            if (m_context) {
                mpv_render_context_free(m_context);
                m_context = nullptr;
            }
            m_player = player;
        }
        if (!m_context && m_player && m_player->handle()) {
            mpv_opengl_init_params glInit{mpvGetProcAddress, nullptr, nullptr};
            mpv_render_param params[] = {
                {MPV_RENDER_PARAM_API_TYPE, const_cast<char *>(MPV_RENDER_API_TYPE_OPENGL)},
                {MPV_RENDER_PARAM_OPENGL_INIT_PARAMS, &glInit},
                {MPV_RENDER_PARAM_INVALID, nullptr}
            };
            const int rc = mpv_render_context_create(&m_context, m_player->handle(), params);
            if (rc < 0) {
                qWarning() << "mpv_render_context_create failed:" << mpv_error_string(rc);
                m_context = nullptr;
            }
        }
    }

    void render() override
    {
        if (!m_context || !framebufferObject())
            return;
        mpv_opengl_fbo fbo;
        fbo.fbo = framebufferObject()->handle();
        fbo.w = framebufferObject()->width();
        fbo.h = framebufferObject()->height();
        fbo.internal_format = 0;
        int flipY = 1;
        mpv_render_param params[] = {
            {MPV_RENDER_PARAM_OPENGL_FBO, &fbo},
            {MPV_RENDER_PARAM_FLIP_Y, &flipY},
            {MPV_RENDER_PARAM_INVALID, nullptr}
        };
        mpv_render_context_render(m_context, params);
        mpv_render_context_report_swap(m_context);
    }

private:
    PlayerCore *m_player = nullptr;
    mpv_render_context *m_context = nullptr;
};

MpvRenderItem::MpvRenderItem(QQuickItem *parent) : QQuickFramebufferObject(parent)
{
    setMirrorVertically(false);
    setTextureFollowsItemSize(true);
}

QQuickFramebufferObject::Renderer *MpvRenderItem::createRenderer() const
{
    return new MpvRenderer();
}

void MpvRenderItem::setPlayer(PlayerCore *player)
{
    if (m_player == player)
        return;
    if (m_player)
        disconnect(m_player, nullptr, this, nullptr);
    m_player = player;
    if (m_player) {
        connect(m_player, &PlayerCore::renderUpdateRequested, this,
                [this]() { update(); }, Qt::QueuedConnection);
    }
    emit playerChanged();
    update();
}
