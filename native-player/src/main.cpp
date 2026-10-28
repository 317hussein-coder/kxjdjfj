#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQuickStyle>
#include <QCoreApplication>
#include <QUrl>
#include "playercore.h"
#include "mpvrenderitem.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);
    QCoreApplication::setApplicationName(QStringLiteral("TatbiqYai Native"));
    QCoreApplication::setOrganizationName(QStringLiteral("TatbiqYai"));
    QQuickStyle::setStyle(QStringLiteral("Basic"));

    qmlRegisterType<MpvRenderItem>("TatbiqYai.Native", 1, 0, "MpvVideo");
    qmlRegisterType<PlayerCore>("TatbiqYai.Native", 1, 0, "PlayerCore");

    QQmlApplicationEngine engine;
    const QUrl url(QStringLiteral("qrc:/qt/qml/qml/Main.qml"));
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
        if (!obj && url == objUrl)
            QCoreApplication::exit(1);
    }, Qt::QueuedConnection);
    engine.load(url);
    if (engine.rootObjects().isEmpty())
        return 1;
    return app.exec();
}
