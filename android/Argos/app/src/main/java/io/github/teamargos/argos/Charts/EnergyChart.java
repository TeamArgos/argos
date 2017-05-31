package io.github.teamargos.argos.Charts;

import android.content.Context;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.drawable.Drawable;
import android.text.Html;
import android.text.Spanned;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.components.AxisBase;
import com.github.mikephil.charting.components.LimitLine;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.Entry;
import com.github.mikephil.charting.formatter.IAxisValueFormatter;

import io.github.teamargos.argos.R;

/**
 * Created by iguest on 5/12/17.
 */

public class EnergyChart extends ArgosBaseChart {

    private List<Entry> points;
    private long min;

    public EnergyChart(Context context, LineChart chart) {
        super(context, chart);
        Drawable d = context.getDrawable(R.drawable.lightning_bolt);
        d.setColorFilter(new PorterDuffColorFilter(Color.YELLOW, PorterDuff.Mode.SRC_IN));
        d.setAlpha(12);
        chart.setBackgroundDrawable(d);
        this.points = new ArrayList<>();
        setLineCubic(false);
        setCircles(true);
        setLineColor(R.color.argosBlue);
        this.min = 0L;
    }

    @Override
    public void render() {
        if (points.size() > 0) {
            setAxes();
            setLabels();
            displayData();
            getChart().invalidate();
        } else {
            getChart().setNoDataText("No energy data for the last month");
        }
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
                long millis = (long)value + min;
                return mFormat.format(new Date(millis));
            }
        });

        YAxis left = this.getChart().getAxisLeft();
        left.setTextColor(this.getColor(R.color.colorTextPrimary));
        left.setAxisMinimum(0.0f);
        left.setValueFormatter(new IAxisValueFormatter() {
            @Override
            public String getFormattedValue(float value, AxisBase axis) {
                Spanned sp = Html.fromHtml("&cent;");
                String cents = sp.toString();
                return String.format("%.2f%s", value, cents);
            }
        });
        left.removeAllLimitLines();

        YAxis right = this.getChart().getAxisRight();
        right.setEnabled(false);
    }

    @Override
    protected List<Entry> getPoints() {
        return this.points;
    }

    public void setData(List<Long> xvals, List<Double> yvals, long min) {
        this.points = new ArrayList<>();
        float sum = 0f;
        int samples = 10;
        int interval = xvals.size() / samples;
        if (interval == 0) interval = 1;
        for (int i = 0; i < xvals.size(); i++) {
            sum += yvals.get(i).floatValue();
            if (i % interval == 0) {
                Entry e = new Entry((float)(xvals.get(i) - min), sum * 100);
                this.points.add(e);
            }
        }
        Collections.sort(this.points, new Comparator<Entry>() {
            @Override
            public int compare(Entry o1, Entry o2) {
                return (int)(o1.getX() - o2.getX());
            }
        });
        this.min = min;
    }
}

