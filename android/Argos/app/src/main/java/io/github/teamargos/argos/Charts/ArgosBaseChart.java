package io.github.teamargos.argos.Charts;

import android.content.Context;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;

import java.util.ArrayList;
import java.util.List;

import io.github.teamargos.argos.Models.Classification;
import io.github.teamargos.argos.R;

/**
 * Created by iguest on 5/12/17.
 */

public abstract class ArgosBaseChart {
    private LineChart chart;
    private Context context;

    private boolean cubic;
    private boolean circles;
    private int color;
    private int circleColor;

    public ArgosBaseChart(Context context, LineChart chart) {
        this.context = context;
        this.chart = chart;
        this.chart.setTouchEnabled(false);
        this.cubic = true;
        this.circles = false;
        color = R.color.colorYellow;
        circleColor = R.color.colorYellow;
    }

    public void setLineCubic(boolean cubic) {
        this.cubic = cubic;
    }

    public void setCircles(boolean circles) {
        this.circles = circles;
    }

    public void setLineColor(int colorId) {
        color = colorId;
    }

    public void setCircleColor(int colorId) {
        this.circleColor = colorId;
    }

    public LineChart getChart() {
        return this.chart;
    }

    protected int getColor(int colorId) {
        return this.getChart().getResources().getColor(colorId);
    }

    protected void displayData() {
        List<Entry> values = getPoints();
        LineDataSet generalSet = new LineDataSet(values, "Data Set");
        if (!circles) {
            generalSet.setDrawCircles(false);
            generalSet.setDrawCircleHole(false);
        } else {
            generalSet.setCircleColor(this.getColor(circleColor));
            generalSet.setCircleColorHole(this.getColor(circleColor));
        }
        generalSet.setDrawHighlightIndicators(false);
        generalSet.setColor(this.getColor(color));
        generalSet.setLineWidth(3.0f);
        generalSet.setDrawValues(false);

        if (this.cubic)
            generalSet.setMode(LineDataSet.Mode.CUBIC_BEZIER);


        LineData d = new LineData(generalSet);
        if (d != null) {
            this.getChart().setData(d);
        }
    }

    protected void setLabels() {
        getChart().getDescription().setEnabled(false);
        getChart().getLegend().setEnabled(false);
    }

    protected abstract List<Entry> getPoints();
    protected abstract void setAxes();

    public abstract void render();
}
