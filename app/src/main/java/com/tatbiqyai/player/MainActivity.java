package com.tatbiqyai.player;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.ui.PlayerView;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {
    private static final int PICK_VIDEO = 71;
    private ExoPlayer player;
    private PlayerView playerView;
    private WebView webView;
    private TextView status;
    private EditText urlInput, speechInput;
    private LinearLayout root;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private boolean fullscreen = false;

    @Override public void onCreate(@Nullable Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(16,16,24));
        getWindow().setNavigationBarColor(Color.rgb(16,16,24));
        buildUi();
        player = new ExoPlayer.Builder(this).build();
        playerView.setPlayer(player);
        playerView.setShowBuffering(PlayerView.SHOW_BUFFERING_ALWAYS);
        player.addListener(new Player.Listener() {
            @Override public void onPlaybackStateChanged(int playbackState) {
                if (status == null || webView.getVisibility() == View.VISIBLE) return;
                if (playbackState == Player.STATE_BUFFERING) status.setText("جارٍ تحميل الفيديو…");
                else if (playbackState == Player.STATE_READY) status.setText("الفيديو جاهز للتشغيل");
                else if (playbackState == Player.STATE_ENDED) status.setText("انتهى الفيديو");
            }
            @Override public void onPlayerError(PlaybackException error) {
                status.setText("تعذّر تشغيل الملف. جرّب رابطًا مباشرًا لملف فيديو، وليس صفحة موقع.");
            }
        });
        tts = new TextToSpeech(this, result -> {
            if (result == TextToSpeech.SUCCESS) {
                int languageResult = tts.setLanguage(new Locale("ar"));
                ttsReady = languageResult != TextToSpeech.LANG_MISSING_DATA &&
                           languageResult != TextToSpeech.LANG_NOT_SUPPORTED;
                if (!ttsReady) status.setText("الصوت العربي غير مثبت: ثبّت بيانات صوت العربية من إعدادات تحويل النص إلى كلام.");
            }
        });
    }

    private int dp(float n) { return (int)(n * getResources().getDisplayMetrics().density + 0.5f); }
    private TextView text(String value, int size, int color) {
        TextView t = new TextView(this); t.setText(value); t.setTextSize(size); t.setTextColor(color); t.setGravity(Gravity.CENTER_VERTICAL); return t;
    }
    private Button button(String value) {
        Button b = new Button(this); b.setText(value); b.setTextColor(Color.WHITE); b.setAllCaps(false);
        b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(86,55,170))); return b;
    }
    private void buildUi() {
        root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(16),dp(12),dp(16),dp(12)); root.setBackgroundColor(Color.rgb(16,16,24));
        TextView title = text("تطبيقياي فيديو",25,Color.WHITE); title.setGravity(Gravity.CENTER); title.setTypeface(null,1);
        root.addView(title,new LinearLayout.LayoutParams(-1,dp(48)));
        TextView subtitle = text("مشغّل فيديو عربي • روابط ويب • قراءة النص بصوت عربي",13,Color.rgb(180,175,200)); subtitle.setGravity(Gravity.CENTER);
        root.addView(subtitle,new LinearLayout.LayoutParams(-1,dp(30)));

        playerView = new PlayerView(this); playerView.setUseController(true); playerView.setBackgroundColor(Color.BLACK);
        root.addView(playerView,new LinearLayout.LayoutParams(-1,0,1f));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.BLACK);
        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setMediaPlaybackRequiresUserGesture(true);
        ws.setAllowFileAccess(false);
        ws.setAllowContentAccess(false);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setVisibility(View.GONE);
        root.addView(webView,new LinearLayout.LayoutParams(-1,0,1f));

        status = text("اختر فيديو أو أدخل رابطًا مباشرًا أو رابط يوتيوب",13,Color.rgb(0,212,177)); status.setGravity(Gravity.CENTER);
        root.addView(status,new LinearLayout.LayoutParams(-1,dp(40)));
        Button pick = button("اختيار فيديو من الجهاز");
        pick.setOnClickListener(v -> { Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT); i.setType("video/*"); i.addCategory(Intent.CATEGORY_OPENABLE); startActivityForResult(i,PICK_VIDEO); });
        root.addView(pick,new LinearLayout.LayoutParams(-1,dp(48)));

        urlInput = new EditText(this); urlInput.setSingleLine(true); urlInput.setTextColor(Color.WHITE); urlInput.setHintTextColor(Color.GRAY);
        urlInput.setHint("رابط فيديو مباشر أو رابط YouTube"); urlInput.setTextSize(14); urlInput.setPadding(dp(12),0,dp(12),0);
        urlInput.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(124,77,255)));
        root.addView(urlInput,new LinearLayout.LayoutParams(-1,dp(52)));
        Button playUrl = button("تشغيل الرابط");
        playUrl.setOnClickListener(v -> playUrl());
        root.addView(playUrl,new LinearLayout.LayoutParams(-1,dp(46)));

        LinearLayout row = new LinearLayout(this); row.setGravity(Gravity.CENTER); row.setOrientation(LinearLayout.HORIZONTAL);
        Button slow=button("0.75×"); slow.setOnClickListener(v -> setSpeed(.75f)); row.addView(slow,new LinearLayout.LayoutParams(0,dp(44),1));
        Button normal=button("1×"); normal.setOnClickListener(v -> setSpeed(1f)); row.addView(normal,new LinearLayout.LayoutParams(0,dp(44),1));
        Button fast=button("1.5×"); fast.setOnClickListener(v -> setSpeed(1.5f)); row.addView(fast,new LinearLayout.LayoutParams(0,dp(44),1));
        Button faster=button("2×"); faster.setOnClickListener(v -> setSpeed(2f)); row.addView(faster,new LinearLayout.LayoutParams(0,dp(44),1)); root.addView(row);

        TextView ttsTitle=text("تحويل النص إلى صوت عربي (على الجهاز)",15,Color.WHITE);
        root.addView(ttsTitle,new LinearLayout.LayoutParams(-1,dp(34)));
        speechInput = new EditText(this); speechInput.setTextColor(Color.WHITE); speechInput.setHintTextColor(Color.GRAY);
        speechInput.setHint("اكتب نصًا عربيًا ليُقرأ بصوت مسموع"); speechInput.setGravity(Gravity.TOP|Gravity.RIGHT);
        speechInput.setMinLines(2); speechInput.setMaxLines(3);
        speechInput.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(124,77,255)));
        root.addView(speechInput,new LinearLayout.LayoutParams(-1,dp(76)));
        LinearLayout speechRow=new LinearLayout(this); speechRow.setOrientation(LinearLayout.HORIZONTAL);
        Button speak=button("اقرأ النص"); speak.setOnClickListener(v -> speakArabic()); speechRow.addView(speak,new LinearLayout.LayoutParams(0,dp(44),1));
        Button stopSpeak=button("إيقاف الصوت"); stopSpeak.setOnClickListener(v -> { if(tts!=null) tts.stop(); }); speechRow.addView(stopSpeak,new LinearLayout.LayoutParams(0,dp(44),1));
        root.addView(speechRow);

        Button full=button("تدوير الشاشة / ملء الشاشة"); full.setOnClickListener(v -> toggleFullscreen());
        root.addView(full,new LinearLayout.LayoutParams(-1,dp(44)));
        setContentView(root);
    }

    private String youtubeId(String raw) {
        try {
            Uri uri = Uri.parse(raw);
            String host = uri.getHost();
            if (host == null) return null;
            host = host.toLowerCase(Locale.ROOT);
            if (!(host.equals("youtube.com") || host.endsWith(".youtube.com") ||
                  host.equals("youtu.be") || host.equals("youtube-nocookie.com") ||
                  host.endsWith(".youtube-nocookie.com"))) return null;
            String id = null;
            if (host.equals("youtu.be")) {
                String path=uri.getPath();
                if(path!=null && path.length()>1) id=path.substring(1).split("/")[0];
            } else {
                id=uri.getQueryParameter("v");
                if(id==null) {
                    String path=uri.getPath();
                    if(path!=null) {
                        Matcher m=Pattern.compile("^/(?:embed|shorts|live)/([A-Za-z0-9_-]{6,})").matcher(path);
                        if(m.find()) id=m.group(1);
                    }
                }
            }
            if(id!=null && id.matches("[A-Za-z0-9_-]{6,}")) return id;
        } catch(Exception ignored) {}
        return null;
    }

    private MediaItem buildMediaItem(Uri uri) {
        String path = uri.getPath() == null ? "" : uri.getPath().toLowerCase(Locale.ROOT);
        MediaItem.Builder builder = new MediaItem.Builder().setUri(uri);
        // Explicit MIME types make streaming links more reliable when the URL has query parameters.
        if (path.endsWith(".m3u8")) builder.setMimeType(MimeTypes.APPLICATION_M3U8);
        else if (path.endsWith(".mpd")) builder.setMimeType(MimeTypes.APPLICATION_MPD);
        return builder.build();
    }

    private void playUrl() {
        String url=urlInput.getText().toString().trim();
        if (!(url.startsWith("https://") || url.startsWith("http://"))) {
            Toast.makeText(this,"أدخل رابطًا يبدأ بـ http أو https",Toast.LENGTH_LONG).show(); return;
        }
        String videoId=youtubeId(url);
        if(videoId!=null) {
            player.pause();
            playerView.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            String html="<!doctype html><html><head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"+
                "<style>html,body{margin:0;padding:0;background:#000;width:100%;height:100%;}"+
                ".frame{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;}"+
                "iframe{width:100%;height:100%;border:0;}</style></head><body><div class=\"frame\">"+
                "<iframe src=\"https://www.youtube-nocookie.com/embed/"+videoId+"?playsinline=1&autoplay=1\" "+
                "title=\"YouTube video player\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>"+
                "</div></body></html>";
            webView.loadDataWithBaseURL("https://tatbiqyai.app/",html,"text/html","UTF-8",null);
            status.setText("تشغيل الفيديو داخل مشغّل YouTube الرسمي");
            return;
        }
        Uri uri=Uri.parse(url);
        String path=uri.getPath()==null?"":uri.getPath().toLowerCase(Locale.ROOT);
        boolean looksLikeDirectMedia=path.matches(".*\\.(mp4|m4v|webm|mkv|mp3|m4a|aac|ogg|wav|flac|m3u8|mpd)(?:$|/).*");
        if(!looksLikeDirectMedia && (uri.getHost()!=null)) {
            Toast.makeText(this,"هذا رابط صفحة ويب وليس ملف فيديو مباشر. يدعم التطبيق حاليًا YouTube المضمّن والملفات المباشرة؛ المواقع الأخرى قد تحتاج مشغّلها الرسمي.",Toast.LENGTH_LONG).show();
        }
        webView.setVisibility(View.GONE);
        playerView.setVisibility(View.VISIBLE);
        try { player.setMediaItem(buildMediaItem(uri)); player.prepare(); player.play(); status.setText("جارٍ فتح الرابط…"); }
        catch (Exception e) { status.setText("الرابط غير صالح"); }
    }

    private void speakArabic() {
        String value=speechInput.getText().toString().trim();
        if(value.isEmpty()) { Toast.makeText(this,"اكتب النص أولًا",Toast.LENGTH_SHORT).show(); return; }
        if(tts==null || !ttsReady) {
            Toast.makeText(this,"صوت العربية غير متاح على الجهاز. ثبّت بيانات صوت العربية من إعدادات تحويل النص إلى كلام.",Toast.LENGTH_LONG).show(); return;
        }
        tts.setSpeechRate(1.0f);
        tts.setPitch(1.0f);
        tts.speak(value,TextToSpeech.QUEUE_FLUSH,null,"tatbiqyai-arabic-tts");
        status.setText("تُقرأ الكتابة بصوت عربي");
    }

    private void setSpeed(float speed) {
        if(player!=null && playerView.getVisibility()==View.VISIBLE) {
            player.setPlaybackSpeed(speed);
            Toast.makeText(this,"سرعة التشغيل: "+speed+"×",Toast.LENGTH_SHORT).show();
        } else Toast.makeText(this,"تحكم السرعة يعمل مع الفيديوهات المباشرة والمحلية",Toast.LENGTH_SHORT).show();
    }
    private void toggleFullscreen() {
        fullscreen=!fullscreen;
        if(fullscreen) { setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE); getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN); root.setPadding(0,0,0,0); }
        else { setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED); getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN); root.setPadding(dp(16),dp(12),dp(16),dp(12)); }
    }
    @Override protected void onActivityResult(int requestCode,int resultCode,@Nullable Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode==PICK_VIDEO && resultCode==Activity.RESULT_OK && data!=null && data.getData()!=null) {
            Uri uri=data.getData();
            try { getContentResolver().takePersistableUriPermission(uri,Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (SecurityException ignored) {}
            webView.setVisibility(View.GONE); playerView.setVisibility(View.VISIBLE);
            player.setMediaItem(buildMediaItem(uri)); player.prepare(); player.play(); status.setText("تم اختيار الفيديو");
        }
    }
    @Override protected void onPause() { super.onPause(); if(webView!=null) webView.onPause(); }
    @Override protected void onResume() { super.onResume(); if(webView!=null) webView.onResume(); }
    @Override protected void onDestroy() {
        if(player!=null){player.release();player=null;}
        if(webView!=null){webView.loadUrl("about:blank");webView.destroy();webView=null;}
        if(tts!=null){tts.stop();tts.shutdown();tts=null;}
        super.onDestroy();
    }
}
