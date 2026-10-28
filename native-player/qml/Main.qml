import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtQuick.Dialogs
import TatbiqYai.Native 1.0

ApplicationWindow {
    id: window
    visible: true
    width: 420
    height: 860
    title: "تطبيقياي فيديو ناتيف"
    color: "#0b0b12"
    layoutDirection: Qt.RightToLeft

    PlayerCore { id: core }

    FileDialog {
        id: videoDialog
        title: "اختر ملف فيديو"
        fileMode: FileDialog.OpenFile
        nameFilters: ["ملفات الفيديو (*.mp4 *.mkv *.avi *.webm *.mov *.m4v)", "كل الملفات (*)"]
        onAccepted: core.open(selectedFile)
    }
    FileDialog {
        id: subtitleDialog
        title: "اختر ملف ترجمة"
        fileMode: FileDialog.OpenFile
        nameFilters: ["ملفات الترجمة (*.srt *.ass *.ssa *.vtt)", "كل الملفات (*)"]
        onAccepted: core.setSubtitleFile(selectedFile)
    }

    Timer {
        interval: 16
        repeat: true
        running: true
        onTriggered: core.pollEvents()
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 16
        spacing: 12

        RowLayout {
            Layout.fillWidth: true
            spacing: 10
            Rectangle {
                width: 44; height: 44; radius: 14
                color: "#7c4dff"
                Text { anchors.centerIn: parent; text: "▶"; color: "white"; font.pixelSize: 22 }
            }
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 2
                Label { text: "تطبيقياي فيديو"; color: "white"; font.pixelSize: 22; font.bold: true }
                Label { text: "مشغّل ناتيف • C++ / libmpv"; color: "#a7a3b8"; font.pixelSize: 12 }
            }
            Rectangle {
                radius: 10; color: core.ready ? "#143a35" : "#3b2b1c"
                implicitWidth: readyLabel.implicitWidth + 18; implicitHeight: 30
                Label { id: readyLabel; anchors.centerIn: parent; text: core.ready ? "المحرك جاهز" : "تهيئة المحرك"; color: core.ready ? "#58e3c2" : "#ffc078"; font.pixelSize: 11 }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.minimumHeight: 220
            radius: 20
            color: "#000000"
            clip: true
            MpvVideo {
                id: videoSurface
                anchors.fill: parent
                player: core
            }
            Label {
                anchors.centerIn: parent
                visible: core.mediaTitle.length === 0
                text: "اختر فيديو للبدء"
                color: "#777487"
                font.pixelSize: 16
            }
            Label {
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: parent.bottom
                anchors.margins: 12
                visible: core.errorString.length > 0
                text: core.errorString
                wrapMode: Text.Wrap
                color: "#ff8b9a"
                background: Rectangle { color: "#d9141824"; radius: 8 }
                padding: 8
            }
        }

        Label {
            Layout.fillWidth: true
            text: core.mediaTitle.length ? core.mediaTitle : "لا يوجد فيديو قيد التشغيل"
            color: "white"
            font.pixelSize: 15
            elide: Text.ElideMiddle
        }

        RowLayout {
            Layout.fillWidth: true
            spacing: 8
            TextField {
                id: urlField
                Layout.fillWidth: true
                placeholderText: "ألصق رابط فيديو مباشر أو رابط منصة"
                inputMethodHints: Qt.ImhUrlCharactersOnly
                onAccepted: {
                    if (text.trim().length > 0) {
                        core.open(text.trim())
                        Qt.inputMethod.hide()
                    }
                }
            }
            Button {
                text: "فتح الرابط"
                highlighted: true
                onClicked: {
                    if (urlField.text.trim().length > 0) {
                        core.open(urlField.text.trim())
                        Qt.inputMethod.hide()
                    }
                }
            }
        }

        Slider {
            id: seekSlider
            Layout.fillWidth: true
            from: 0
            to: Math.max(1, core.duration)
            value: Math.min(core.position, to)
            onMoved: core.seekAbsolute(value)
        }

        RowLayout {
            Layout.fillWidth: true
            Label { text: formatTime(core.position); color: "#c6c2d6"; font.pixelSize: 12 }
            Item { Layout.fillWidth: true }
            Label { text: formatTime(core.duration); color: "#c6c2d6"; font.pixelSize: 12 }
        }

        RowLayout {
            Layout.fillWidth: true
            spacing: 10
            Button {
                Layout.fillWidth: true
                text: "فتح فيديو"
                onClicked: videoDialog.open()
            }
            Button {
                Layout.fillWidth: true
                text: core.playing ? "إيقاف مؤقت" : "تشغيل"
                highlighted: true
                onClicked: core.togglePause()
            }
            Button {
                Layout.fillWidth: true
                text: "ترجمة"
                onClicked: subtitleDialog.open()
            }
        }

        RowLayout {
            Layout.fillWidth: true
            spacing: 8
            Button { text: "−10 ث"; Layout.fillWidth: true; onClicked: core.seekRelative(-10) }
            Button { text: "+10 ث"; Layout.fillWidth: true; onClicked: core.seekRelative(10) }
            Button { text: "الصوت"; Layout.fillWidth: true; onClicked: core.cycleAudioTrack() }
            Button { text: "الترجمة"; Layout.fillWidth: true; onClicked: core.cycleSubtitleTrack() }
        }

        Rectangle {
            Layout.fillWidth: true
            radius: 16
            color: "#171622"
            border.color: "#292638"
            implicitHeight: 104
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 12
                spacing: 4
                RowLayout {
                    Layout.fillWidth: true
                    Label { text: "مستوى الصوت"; color: "#e8e5f2" }
                    Item { Layout.fillWidth: true }
                    Label { text: Math.round(core.volume) + "%"; color: "#aaa5bf" }
                }
                Slider {
                    Layout.fillWidth: true
                    from: 0; to: 150
                    value: core.volume
                    onMoved: core.volume = value
                }
                RowLayout {
                    Layout.fillWidth: true
                    Label { text: "سرعة التشغيل"; color: "#e8e5f2" }
                    Item { Layout.fillWidth: true }
                    Repeater {
                        model: [0.75, 1.0, 1.25, 1.5, 2.0]
                        delegate: Button {
                            required property var modelData
                            text: modelData + "×"
                            highlighted: Math.abs(core.speed - modelData) < 0.01
                            onClicked: core.speed = modelData
                            padding: 7
                        }
                    }
                }
            }
        }

        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 270
            radius: 16
            color: "#171622"
            border.color: "#292638"
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 10
                spacing: 8
                Label { text: "أدوات متقدمة — 30 ميزة إضافية"; color: "#e8e5f2"; font.pixelSize: 15; font.bold: true }
                ScrollView {
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    clip: true
                    GridLayout {
                        width: parent.width
                        columns: 3
                        rowSpacing: 6
                        columnSpacing: 6
                        Repeater {
                            model: [
                                {label:"كتم الصوت", action:"mute"},
                                {label:"لقطة فيديو", action:"screenshot"},
                                {label:"لقطة مع الترجمة", action:"screenshot-subtitles"},
                                {label:"نسبة تلقائية", action:"aspect-auto"},
                                {label:"نسبة 16:9", action:"aspect-16-9"},
                                {label:"نسبة 4:3", action:"aspect-4-3"},
                                {label:"تدوير 90°", action:"rotate"},
                                {label:"إزالة التداخل", action:"deinterlace"},
                                {label:"تكرار الفيديو", action:"loop"},
                                {label:"التالي بالقائمة", action:"next"},
                                {label:"السابق بالقائمة", action:"previous"},
                                {label:"إطار للأمام", action:"frame-forward"},
                                {label:"إطار للخلف", action:"frame-back"},
                                {label:"تأخير الترجمة +", action:"subtitle-delay-plus"},
                                {label:"تأخير الترجمة −", action:"subtitle-delay-minus"},
                                {label:"تأخير الصوت +", action:"audio-delay-plus"},
                                {label:"تأخير الصوت −", action:"audio-delay-minus"},
                                {label:"تكبير الترجمة", action:"subtitle-size-plus"},
                                {label:"تصغير الترجمة", action:"subtitle-size-minus"},
                                {label:"الترجمة أعلى", action:"subtitle-up"},
                                {label:"الترجمة أسفل", action:"subtitle-down"},
                                {label:"سطوع +", action:"brightness-plus"},
                                {label:"سطوع −", action:"brightness-minus"},
                                {label:"تباين +", action:"contrast-plus"},
                                {label:"تباين −", action:"contrast-minus"},
                                {label:"تشبع +", action:"saturation-plus"},
                                {label:"تشبع −", action:"saturation-minus"},
                                {label:"جاما +", action:"gamma-plus"},
                                {label:"جاما −", action:"gamma-minus"},
                                {label:"إعادة الصورة", action:"reset-picture"},
                                {label:"تكبير الصورة", action:"zoom-in"},
                                {label:"تصغير الصورة", action:"zoom-out"},
                                {label:"تحريك يسار", action:"pan-left"},
                                {label:"تحريك يمين", action:"pan-right"},
                                {label:"تحريك أعلى", action:"pan-up"},
                                {label:"تحريك أسفل", action:"pan-down"},
                                {label:"إعادة الزوم", action:"reset-zoom"}
                            ]
                            delegate: Button {
                                required property var modelData
                                Layout.fillWidth: true
                                text: modelData.label
                                onClicked: core.action(modelData.action)
                                padding: 6
                                font.pixelSize: 11
                            }
                        }
                    }
                }
            }
        }

        Label {
            Layout.fillWidth: true
            text: "يدعم المحرك الترجمات المحلية والصوت المتعدد والبحث الدقيق حسب قدرات libmpv المضمّنة."
            color: "#777487"
            font.pixelSize: 11
            wrapMode: Text.Wrap
        }
    }

    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return "00:00"
        const total = Math.floor(seconds)
        const h = Math.floor(total / 3600)
        const m = Math.floor((total % 3600) / 60)
        const s = total % 60
        return h > 0 ? h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
                     : String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
    }
}
