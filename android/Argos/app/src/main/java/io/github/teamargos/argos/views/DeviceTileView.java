package io.github.teamargos.argos.views;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextClock;
import android.widget.TextView;

import io.github.teamargos.argos.R;

/**
 * Created by jordan on 4/11/17.
 */

public class DeviceTileView extends LinearLayout {
    private ImageView icon;
    private TextView name;

    public DeviceTileView(Context context) {
        super(context);
        init();
    }

    public DeviceTileView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public DeviceTileView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init();
    }

    private void init() {
        inflate(getContext(), R.layout.view_device_tile, this);
        this.name = (TextView)findViewById(R.id.device_name);
        this.name.setText("Test");
    }
}
