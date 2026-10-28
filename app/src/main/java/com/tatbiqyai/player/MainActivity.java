package com.tatbiqyai.player;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.HorizontalScrollView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.media3.common.MediaItem;
import androidx.media3.common.MimeTypes;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.common.C;
import androidx.media3.common.MediaItem.SubtitleConfiguration;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.ui.PlayerView;
import java.util.Locale;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends Activity {
    private static final int PICK_VIDEO = 71;
    private static final int PICK_SUBTITLE = 72;
    private ExoPlayer player;
    private PlayerView playerView;
    private TextView status;
    private EditText urlInput, speechInput;
    private LinearLayout root;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private boolean fullscreen = false;
    private Uri currentMediaUri;
    private Uri externalSubtitleUri;
    private final List<Uri> playlist = new ArrayList<>();

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
                if (status == null) return;
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
    private GradientDrawable shape(int color, int radius) {
        GradientDrawable d = new GradientDrawable(); d.setColor(color); d.setCornerRadius(dp(radius)); return d;
    }
    private Button button(String value) {
        Button b = new Button(this); b.setText(value); b.setTextColor(Color.WHITE); b.setAllCaps(false);
        b.setTextSize(13); b.setMinHeight(dp(44)); b.setPadding(dp(12),dp(4),dp(12),dp(4));
        b.setBackground(shape(Color.rgb(43,39,63),14));
        if (android.os.Build.VERSION.SDK_INT >= 21) b.setStateListAnimator(null);
        return b;
    }
    private LinearLayout column() {
        LinearLayout l=new LinearLayout(this); l.setOrientation(LinearLayout.VERTICAL); return l;
    }
    private LinearLayout horizontal() {
        LinearLayout l=new LinearLayout(this); l.setOrientation(LinearLayout.HORIZONTAL); l.setGravity(Gravity.CENTER_VERTICAL); return l;
    }
    private void section(LinearLayout parent, String heading, String detail) {
        LinearLayout card=column(); card.setPadding(dp(14),dp(10),dp(14),dp(12)); card.setBackground(shape(Color.rgb(27,26,40),18));
        TextView h=text(heading,16,Color.WHITE); h.setTypeface(null,1); card.addView(h);
        if(detail!=null&&!detail.isEmpty()){ TextView d=text(detail,12,Color.rgb(166,163,188)); card.addView(d); }
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2); p.bottomMargin=dp(12); parent.addView(card,p);
    }
    private void buildUi() {
        getWindow().setStatusBarColor(Color.rgb(13,12,21));
        getWindow().setNavigationBarColor(Color.rgb(13,12,21));
        root=column(); root.setPadding(dp(14),dp(8),dp(14),dp(18)); root.setBackgroundColor(Color.rgb(13,12,21));
        ScrollView scroll=new ScrollView(this); scroll.setFillViewport(true); scroll.setClipToPadding(false);
        LinearLayout page=column(); scroll.addView(page,new ScrollView.LayoutParams(-1,-2));
        LinearLayout header=horizontal(); header.setPadding(dp(4),dp(8),dp(4),dp(12));
        LinearLayout brand=column();
        TextView title=text("تطبيقياي",27,Color.WHITE); title.setTypeface(null,1); brand.addView(title);
        TextView subtitle=text("VIDEO STUDIO  •  مشغّل الوسائط",10,Color.rgb(0,218,183)); brand.addView(subtitle);
        header.addView(brand,new LinearLayout.LayoutParams(0,-2,1));
        TextView badge=text("مشغّل محلي",11,Color.rgb(0,218,183)); badge.setGravity(Gravity.CENTER); badge.setPadding(dp(10),dp(7),dp(10),dp(7)); badge.setBackground(shape(Color.rgb(25,55,53),30)); header.addView(badge);
        page.addView(header);

        LinearLayout playerCard=column(); playerCard.setPadding(dp(7),dp(7),dp(7),dp(10)); playerCard.setBackground(shape(Color.rgb(27,26,40),20));
        playerView=new PlayerView(this); playerView.setUseController(true); playerView.setShowBuffering(PlayerView.SHOW_BUFFERING_ALWAYS); playerView.setBackground(shape(Color.BLACK,15));
        playerCard.addView(playerView,new LinearLayout.LayoutParams(-1,dp(224)));
        status=text("جاهز — اختر فيديو من جهازك أو ألصق رابطًا مباشرًا",12,Color.rgb(0,218,183)); status.setGravity(Gravity.CENTER); status.setPadding(dp(5),dp(9),dp(5),dp(2));
        playerCard.addView(status,new LinearLayout.LayoutParams(-1,-2));
        LinearLayout.LayoutParams pp=new LinearLayout.LayoutParams(-1,-2); pp.bottomMargin=dp(14); page.addView(playerCard,pp);

        LinearLayout sourceCard=column(); sourceCard.setPadding(dp(14),dp(12),dp(14),dp(14)); sourceCard.setBackground(shape(Color.rgb(27,26,40),18));
        TextView sourceTitle=text("ابدأ المشاهدة",17,Color.WHITE); sourceTitle.setTypeface(null,1); sourceCard.addView(sourceTitle);
        TextView sourceHint=text("تشغيل من الجهاز أو من رابط بث مباشر",12,Color.rgb(166,163,188)); sourceCard.addView(sourceHint);
        LinearLayout sourceRow=horizontal(); sourceRow.setPadding(0,dp(8),0,dp(6));
        Button pick=button("＋ ملفات الجهاز"); pick.setBackground(shape(Color.rgb(102,67,224),14));
        pick.setOnClickListener(v->{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("video/*");i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE,true);i.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(i,PICK_VIDEO);});
        sourceRow.addView(pick,new LinearLayout.LayoutParams(0,dp(48),1));
        Button next=button("التالي ⏭"); next.setOnClickListener(v->playNext());
        LinearLayout.LayoutParams np=new LinearLayout.LayoutParams(0,dp(48),1); np.leftMargin=dp(8); sourceRow.addView(next,np); sourceCard.addView(sourceRow);
        urlInput=new EditText(this); urlInput.setSingleLine(true); urlInput.setTextColor(Color.WHITE); urlInput.setHintTextColor(Color.rgb(132,129,151));
        urlInput.setHint("ألصق رابط فيديو / YouTube"); urlInput.setTextSize(14); urlInput.setPadding(dp(13),0,dp(13),0); urlInput.setBackground(shape(Color.rgb(17,17,27),12));
        sourceCard.addView(urlInput,new LinearLayout.LayoutParams(-1,dp(49)));
        Button playUrl=button("تشغيل الرابط  ▶"); playUrl.setBackground(shape(Color.rgb(0,133,116),13));
        playUrl.setOnClickListener(v->playUrl()); LinearLayout.LayoutParams urp=new LinearLayout.LayoutParams(-1,dp(46)); urp.topMargin=dp(8); sourceCard.addView(playUrl,urp);
        LinearLayout.LayoutParams sp=new LinearLayout.LayoutParams(-1,-2); sp.bottomMargin=dp(13); page.addView(sourceCard,sp);

        LinearLayout tools=column(); tools.setPadding(dp(14),dp(12),dp(14),dp(13)); tools.setBackground(shape(Color.rgb(27,26,40),18));
        TextView toolsTitle=text("أدوات المشاهدة",17,Color.WHITE); toolsTitle.setTypeface(null,1); tools.addView(toolsTitle);
        TextView speedLabel=text("سرعة التشغيل",12,Color.rgb(166,163,188)); tools.addView(speedLabel);
        LinearLayout speedRow=horizontal(); float[] speeds={0.5f,0.75f,1f,1.25f,1.5f,2f};
        for(float speed:speeds){ final float value=speed; String label=(speed==(int)speed?Integer.toString((int)speed):Float.toString(speed))+"×"; Button b=button(label); if(speed==1f)b.setBackground(shape(Color.rgb(102,67,224),12)); b.setOnClickListener(v->setSpeed(value)); LinearLayout.LayoutParams bp=new LinearLayout.LayoutParams(0,dp(42),1); bp.rightMargin=dp(4); speedRow.addView(b,bp); }
        tools.addView(speedRow);
        LinearLayout utilityRow=horizontal(); Button subs=button("字幕 SRT/VTT"); subs.setOnClickListener(v->{Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("*/*");i.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(i,PICK_SUBTITLE);});
        utilityRow.addView(subs,new LinearLayout.LayoutParams(0,dp(44),1));
        Button full=button("ملء الشاشة"); full.setOnClickListener(v->toggleFullscreen()); LinearLayout.LayoutParams fp=new LinearLayout.LayoutParams(0,dp(44),1); fp.leftMargin=dp(8); utilityRow.addView(full,fp); tools.addView(utilityRow);
        LinearLayout.LayoutParams tp=new LinearLayout.LayoutParams(-1,-2); tp.bottomMargin=dp(13); page.addView(tools,tp);

        LinearLayout speech=column(); speech.setPadding(dp(14),dp(12),dp(14),dp(13)); speech.setBackground(shape(Color.rgb(27,26,40),18));
        TextView speechTitle=text("قارئ النص العربي",17,Color.WHITE); speechTitle.setTypeface(null,1); speech.addView(speechTitle);
        TextView speechHint=text("حوّل النص إلى كلام باستخدام صوت الجهاز",12,Color.rgb(166,163,188)); speech.addView(speechHint);
        speechInput=new EditText(this); speechInput.setTextColor(Color.WHITE); speechInput.setHintTextColor(Color.rgb(132,129,151)); speechInput.setHint("اكتب النص هنا…"); speechInput.setGravity(Gravity.TOP|Gravity.RIGHT); speechInput.setMinLines(2); speechInput.setMaxLines(4); speechInput.setPadding(dp(12),dp(10),dp(12),dp(10)); speechInput.setBackground(shape(Color.rgb(17,17,27),12));
        LinearLayout.LayoutParams sip=new LinearLayout.LayoutParams(-1,dp(92)); sip.topMargin=dp(8); speech.addView(speechInput,sip);
        LinearLayout speechRow=horizontal(); Button speak=button("اقرأ النص"); speak.setBackground(shape(Color.rgb(102,67,224),12)); speak.setOnClickListener(v->speakArabic()); speechRow.addView(speak,new LinearLayout.LayoutParams(0,dp(44),1));
        Button stopSpeak=button("إيقاف الصوت"); stopSpeak.setOnClickListener(v->{if(tts!=null)tts.stop();}); LinearLayout.LayoutParams stp=new LinearLayout.LayoutParams(0,dp(44),1); stp.leftMargin=dp(8); speechRow.addView(stopSpeak,stp);
        LinearLayout.LayoutParams srp=new LinearLayout.LayoutParams(-1,-2); srp.topMargin=dp(8); speech.addView(speechRow,srp); page.addView(speech);
        TextView footer=text("صُمّم للمشاهدة على جهازك  •  TatbiqYai",10,Color.rgb(105,102,125)); footer.setGravity(Gravity.CENTER); LinearLayout.LayoutParams ftp=new LinearLayout.LayoutParams(-1,dp(42)); page.addView(footer,ftp);
        root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1)); setContentView(root);
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
        if (externalSubtitleUri != null) {
            String subtitlePath = externalSubtitleUri.getLastPathSegment() == null ? "" : externalSubtitleUri.getLastPathSegment().toLowerCase(Locale.ROOT);
            String subtitleMime = subtitlePath.endsWith(".vtt") ? MimeTypes.TEXT_VTT :
                    (subtitlePath.endsWith(".ssa") || subtitlePath.endsWith(".ass")) ? MimeTypes.TEXT_SSA :
                    MimeTypes.APPLICATION_SUBRIP;
            SubtitleConfiguration subtitle = new SubtitleConfiguration.Builder(externalSubtitleUri)
                    .setMimeType(subtitleMime).setLanguage("ar").setSelectionFlags(C.SELECTION_FLAG_DEFAULT).build();
            builder.setSubtitleConfigurations(java.util.Collections.singletonList(subtitle));
        }
        return builder.build();
    }

    private void playUrl() {
        String url=urlInput.getText().toString().trim();
        if (!(url.startsWith("https://") || url.startsWith("http://"))) {
            Toast.makeText(this,"أدخل رابطًا يبدأ بـ http أو https",Toast.LENGTH_LONG).show(); return;
        }
        String videoId=youtubeId(url);
        if(videoId!=null) {
            Toast.makeText(this,
                "هذا الإصدار لا يشغّل صفحات YouTube داخليًا. استخدم إصدار المشغّل الأصلي libmpv؛ لا ينبغي تحويلك إلى تطبيق YouTube.",
                Toast.LENGTH_LONG).show();
            status.setText("رابط YouTube يحتاج استخراج بث متوافق مع المحرك الأصلي.");
            return;
        }
        Uri uri=Uri.parse(url);
        currentMediaUri = uri;
        playlist.clear(); playlist.add(uri);
        String path=uri.getPath()==null?"":uri.getPath().toLowerCase(Locale.ROOT);
        boolean looksLikeDirectMedia=path.matches(".*\\.(mp4|m4v|webm|mkv|mp3|m4a|aac|ogg|wav|flac|m3u8|mpd)(?:$|/).*");
        if(!looksLikeDirectMedia && (uri.getHost()!=null)) {
            Toast.makeText(this,"هذا رابط صفحة ويب وليس ملف فيديو مباشر. يدعم التطبيق حاليًا YouTube المضمّن والملفات المباشرة؛ المواقع الأخرى قد تحتاج مشغّلها الرسمي.",Toast.LENGTH_LONG).show();
        }
        try { player.setMediaItem(buildMediaItem(uri)); player.prepare(); player.play(); status.setText("جارٍ فتح الرابط…"); }
        catch (Exception e) { status.setText("الرابط غير صالح"); }
    }

    private void playNext() {
        if (player != null && player.hasNextMediaItem()) {
            player.seekToNextMediaItem(); player.play(); status.setText("جارٍ تشغيل الفيديو التالي");
        } else Toast.makeText(this, "لا يوجد فيديو تالٍ. اختر عدة فيديوهات لإنشاء قائمة تشغيل.", Toast.LENGTH_LONG).show();
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
        if(resultCode != Activity.RESULT_OK || data == null) return;
        if(requestCode == PICK_SUBTITLE && data.getData() != null) {
            externalSubtitleUri = data.getData();
            try { getContentResolver().takePersistableUriPermission(externalSubtitleUri, Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (SecurityException ignored) {}
            if(currentMediaUri != null) {
                try { player.setMediaItem(buildMediaItem(currentMediaUri), false); player.prepare(); player.play(); status.setText("تمت إضافة الترجمة الخارجية"); }
                catch(Exception e) { status.setText("تعذرت إضافة الترجمة لهذا الملف"); }
            } else Toast.makeText(this, "تم اختيار الترجمة. افتح الفيديو لإرفاقها به.", Toast.LENGTH_LONG).show();
            return;
        }
        if(requestCode == PICK_VIDEO) {
            playlist.clear();
            if(data.getClipData() != null) {
                for(int i=0;i<data.getClipData().getItemCount();i++) {
                    Uri uri=data.getClipData().getItemAt(i).getUri(); playlist.add(uri);
                    try { getContentResolver().takePersistableUriPermission(uri,Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (SecurityException ignored) {}
                }
            } else if(data.getData()!=null) {
                Uri uri=data.getData(); playlist.add(uri);
                try { getContentResolver().takePersistableUriPermission(uri,Intent.FLAG_GRANT_READ_URI_PERMISSION); } catch (SecurityException ignored) {}
            }
            if(!playlist.isEmpty()) {
                currentMediaUri=playlist.get(0);
                List<MediaItem> items=new ArrayList<>();
                for(Uri uri:playlist) items.add(buildMediaItem(uri));
                player.setMediaItems(items,0,0); player.prepare(); player.play();
                status.setText("قائمة تشغيل: "+playlist.size()+" فيديو");
            }
        }
    }
    @Override protected void onPause() { super.onPause(); }
    @Override protected void onResume() { super.onResume(); }
    @Override protected void onDestroy() {
        if(player!=null){player.release();player=null;}
        if(tts!=null){tts.stop();tts.shutdown();tts=null;}
        super.onDestroy();
    }
}
