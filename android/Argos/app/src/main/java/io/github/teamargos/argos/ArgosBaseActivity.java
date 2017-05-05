package io.github.teamargos.argos;

import android.graphics.Typeface;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.widget.TextView;

/**
 * Created by jordan on 4/28/17.
 */

public class ArgosBaseActivity extends AppCompatActivity {
    public void setToolbarFont(Toolbar toolbar, int headerId) {
        TextView tv = (TextView)toolbar.findViewById(headerId);
        tv.setTextSize(34);
        Typeface font = Typeface.createFromAsset(getAssets(),  "fonts/Ailerons-Typeface.otf");
        tv.setTypeface(font);
    }
}
