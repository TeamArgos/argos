package io.github.teamargos.argos.Views;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.widget.LinearLayout;

/**
 * Created by iguest on 5/9/17.
 */

public class ChartContainer extends LinearLayout {
    Paint paint = new Paint();

    public ChartContainer(Context context) {
        super(context);
    }

    public ChartContainer(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    private void initPaint() {
        paint.setColor(Color.BLACK);
        paint.setStrokeWidth(2f);
    }

    @Override
    public void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        canvas.drawLine(0, 50, 20, 50, paint);
    }
}