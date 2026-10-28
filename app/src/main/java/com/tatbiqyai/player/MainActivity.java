package com.tatbiqyai.player;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.Nullable;
import androidx.media3.common.MediaItem;
import androidx.media3.common.PlaybackException;
import androidx.media3.common.Player;
import androidx.media3.exoplayer.ExoPlayer;
import androidx.media3.ui.PlayerView;

public class MainActivity extends Activity {
    private static final int PICK_VIDEO = 71;
    private ExoPlayer player;
    private PlayerView playerView;
    private TextView status;
    private EditText urlInput;
    private LinearLayout root;
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
                if (status == null) return;
                if (playbackState == Player.STATE_BUFFERING) status.setText("جارٍ تحميل الفيديو…");
                else if (playbackState == Player.STATE_READY) status.setText("الفيديو جاهز للتشغيل");
                else if (playbackState == Player.STATE_ENDED) status.setText("انتهى الفيديو");
            }
            @Override public void onPlayerError(PlaybackException error) {
                status.setText("تعذّر تشغيل الفيديو. تحقق من الرابط أو صيغة الملف.");
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
        TextView subtitle = text("مشغّل فيديو بسيط وسريع",14,Color.rgb(180,175,200)); subtitle.setGravity(Gravity.CENTER);
        root.addView(subtitle,new LinearLayout.LayoutParams(-1,dp(30)));
        playerView = new PlayerView(this); playerView.setUseController(true); playerView.setBackgroundColor(Color.BLACK);
        root.addView(playerView,new LinearLayout.LayoutParams(-1,0,1f));
        status = text("اختر فيديو من جهازك أو أدخل رابطًا مباشرًا",13,Color.rgb(0,212,177)); status.setGravity(Gravity.CENTER);
        root.addView(status,new LinearLayout.LayoutParams(-1,dp(40)));
        Button pick = button("اختيار فيديو من الجهاز");
        pick.setOnClickListener(v -> { Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT); i.setType("video/*"); i.addCategory(Intent.CATEGORY_OPENABLE); startActivityForResult(i,PICK_VIDEO); });
        root.addView(pick,new LinearLayout.LayoutParams(-1,dp(52)));
        urlInput = new EditText(this); urlInput.setSingleLine(true); urlInput.setTextColor(Color.WHITE); urlInput.setHintTextColor(Color.GRAY);
        urlInput.setHint("https://example.com/video.mp4"); urlInput.setTextSize(14); urlInput.setPadding(dp(12),0,dp(12),0);
        urlInput.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.rgb(124,77,255)));
        root.addView(urlInput,new LinearLayout.LayoutParams(-1,dp(54)));
        Button playUrl = button("تشغيل الرابط"); playUrl.setOnClickListener(v -> playUrl()); root.addView(playUrl,new LinearLayout.LayoutParams(-1,dp(48)));
        LinearLayout row = new LinearLayout(this); row.setGravity(Gravity.CENTER); row.setOrientation(LinearLayout.HORIZONTAL);
        Button slow=button("0.75×"); slow.setOnClickListener(v -> setSpeed(.75f)); row.addView(slow,new LinearLayout.LayoutParams(0,dp(48),1));
        Button normal=button("1×"); normal.setOnClickListener(v -> setSpeed(1f)); row.addView(normal,new LinearLayout.LayoutParams(0,dp(48),1));
        Button fast=button("1.5×"); fast.setOnClickListener(v -> setSpeed(1.5f)); row.addView(fast,new LinearLayout.LayoutParams(0,dp(48),1));
        Button faster=button("2×"); faster.setOnClickListener(v -> setSpeed(2f)); row.addView(faster,new LinearLayout.LayoutParams(0,dp(48),1)); root.addView(row);
        Button full=button("تدوير الشاشة / ملء الشاشة"); full.setOnClickListener(v -> toggleFullscreen()); root.addView(full,new LinearLayout.LayoutParams(-1,dp(48)));
        setContentView(root);
    }
    private void playUrl() {
        String url=urlInput.getText().toString().trim();
        if (!(url.startsWith("https://") || url.startsWith("http://"))) {
            Toast.makeText(this,"أدخل رابط فيديو مباشر يبدأ بـ http أو https",Toast.LENGTH_LONG).show(); return;
        }
        try { player.setMediaItem(MediaItem.fromUri(Uri.parse(url))); player.prepare(); player.play(); status.setText("جارٍ فتح الرابط…"); }
        catch (Exception e) { status.setText("الرابط غير صالح"); }
    }
    private void setSpeed(float speed) {
        if(player!=null) { player.setPlaybackSpeed(speed); Toast.makeText(this,"سرعة التشغيل: "+speed+"×",Toast.LENGTH_SHORT).show(); }
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
            player.setMediaItem(MediaItem.fromUri(uri)); player.prepare(); player.play(); status.setText("تم اختيار الفيديو");
        }
    }
    @Override protected void onDestroy() { if(player!=null){player.release();player=null;} super.onDestroy(); }
}
