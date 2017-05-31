package io.github.teamargos.argos.Charts;

import android.content.Context;
import android.util.Log;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.AxisBase;
import com.github.mikephil.charting.components.LimitLine;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.data.LineData;
import com.github.mikephil.charting.data.LineDataSet;
import com.github.mikephil.charting.formatter.IAxisValueFormatter;
import com.github.mikephil.charting.utils.MPPointD;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import io.github.teamargos.argos.Models.Classification;
import io.github.teamargos.argos.R;

/**
 * Created by jordan on 5/5/17.
 */
public class AlgorithmCertaintyChart extends ArgosBaseChart {
    private List<Classification> data;
    private long min;
    private float lineHeight;

    public AlgorithmCertaintyChart(Context context, LineChart chart) {
        super(context, chart);
        this.lineHeight = 80f;
        this.data = new ArrayList<>();
        this.min = 0;
    }

    public boolean hasData() {
        return data.size() > 0;
    }

    public float getLineHeight() {
        return this.lineHeight;
    }

    public void setLineHeight(MPPointD point) {
        float val = (float) point.y;
        if (val >= 0 && val <= 100.0) {
            this.lineHeight = (float) point.y;
        }
        render();
    }

    public void setLineHeight(float pixelY) {
        int[] coords = new int[]{0, 0};
        getChart().getLocationOnScreen(coords);
        MPPointD point = getChart().getValuesByTouchPoint(0, pixelY - coords[1], YAxis.AxisDependency.LEFT);
        setLineHeight(point);
    }

    @Override
    protected List<Entry> getPoints() {
        List<Entry> points = new ArrayList<>();
        if (data.size() > 0) {
            min = this.data.get(0).timestamp;

            for (Classification d : this.data) {
                System.out.println(d.timestamp);
                System.out.println(new Date(d.timestamp));
                Entry e = new Entry(d.timestamp - min, d.certainty * 100f);
                if (d.className.equals("on")) {
                    e.setY(100.0f - e.getY());
                }
                points.add(e);
            }
        }
        return points;
    }

    private LimitLine getLine() {
        LimitLine line = new LimitLine(lineHeight);
        line.setLineColor(this.getColor(R.color.colorRefLine));
        line.setLineWidth(4f);
        String label = String.format(java.util.Locale.US, "Light Score Threshold: %.2f",
                this.lineHeight);
        line.setLabel(label);
        line.setTextColor(this.getColor(R.color.colorTextPrimary));
        return line;
    }

    @Override
    protected void setAxes() {
        XAxis xAxis = this.getChart().getXAxis();
        xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
        xAxis.setTextColor(this.getColor(R.color.colorTextPrimary));
        xAxis.setLabelCount(5);
        xAxis.setValueFormatter(new IAxisValueFormatter() {
            private SimpleDateFormat mFormat = new SimpleDateFormat("hh:mma");

            @Override
            public String getFormattedValue(float value, AxisBase axis) {
                long millis = ((long) value) + min;
                System.out.println(new Date(millis));
                return mFormat.format(new Date(millis));
            }
        });

        YAxis left = this.getChart().getAxisLeft();
        left.setTextColor(this.getColor(R.color.colorTextPrimary));
        left.setAxisMaximum(100.0f);
        left.setAxisMinimum(0.0f);
        left.removeAllLimitLines();
        LimitLine line = getLine();
        if (line != null) {
            left.addLimitLine(line);
        }

        YAxis right = this.getChart().getAxisRight();
        right.setEnabled(false);
    }

    @Override
    public void render() {
        if (data.size() > 0) {
            setAxes();
            setLabels();
            displayData();
            getChart().invalidate();
        } else {
            getChart().setNoDataText("No device data for the last day");
        }
    }

    public void setData(List<Classification> devices) {
        List<Classification> d = new ArrayList<>();
        Collections.sort(devices);
        int len = devices.size();
        int samples = 10;
        if (len > 0 && samples > 0) {
            int step = len > samples ? len / samples : 1;
            for (int i = 0; i < len; i++) {
                if (i % step == 0) {
                    Classification c = devices.get(i);
                    d.add(c);
                }
            }
            this.data = d;
        }
    }
}