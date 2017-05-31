package io.github.teamargos.argos;

import android.app.DialogFragment;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteDatabaseLockedException;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ScrollView;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.utils.MPPointD;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.github.teamargos.argos.Charts.AlgorithmCertaintyChart;
import io.github.teamargos.argos.Fragments.ChartInfoDialog;
import io.github.teamargos.argos.Models.Device;
import io.github.teamargos.argos.Adapters.DeviceGridAdapter;
import io.github.teamargos.argos.Models.DeviceStateChange;
import io.github.teamargos.argos.Models.StateChangeResponse;
import io.github.teamargos.argos.Utils.HttpUtils;
import io.github.teamargos.argos.Views.ExpandableHeightGridView;

public class DashboardActivity extends DrawerActivity implements SwipeRefreshLayout.OnRefreshListener {

    private String TAG = "DASHBOARD";
    private ExpandableHeightGridView grid;
    private DeviceGridAdapter gridAdapter;
    private SwipeRefreshLayout swipeView;
    private ScrollView scrollView;
    private AlgorithmCertaintyChart chart;
    private boolean settingLineHeight;
    private List<Device> devices;
    private SharedPreferences prefs;
    private SQLiteDatabase db;
    private BroadcastReceiver receiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        db = openOrCreateDatabase("ArgosDb",MODE_PRIVATE,null);
        db.execSQL("CREATE TABLE IF NOT EXISTS Notification(_id INTEGER PRIMARY KEY AUTOINCREMENT, DeviceName VARCHAR, DeviceId VARCHAR, FulcrumId VARCHAR, DesiredState INTEGER);");
        db.execSQL("CREATE TABLE IF NOT EXISTS Devices(_id VARCHAR PRIMARY KEY, FulcrumId VARCHAR, DeviceName VARCHAR);");
        settingLineHeight = false;
        receiver = new NotificationReceiver();
        registerReceiver(receiver, new IntentFilter("NOTIFICATION_EVENT"));

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);
        setupDrawer();

        LineChart chartView = (LineChart) findViewById(R.id.chart);
        chart = new AlgorithmCertaintyChart(this, chartView);
        chart.render();

        swipeView = (SwipeRefreshLayout) findViewById(R.id.device_refresh);
        swipeView.setOnRefreshListener(this);

        prefs = getSharedPreferences(getString(R.string.user_id), 0);

        ImageView info = (ImageView) findViewById(R.id.infoIcon);
        info.setImageResource(R.mipmap.ic_info_outline_black_24dp);
        Drawable dInfo = info.getDrawable();
        dInfo.setColorFilter(Color.WHITE, PorterDuff.Mode.SRC_IN);
        info.setImageDrawable(dInfo);
        info.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                DialogFragment f = new ChartInfoDialog();
                f.show(getFragmentManager(), "info");
            }
        });

        getDeviceData();

        scrollView = (ScrollView) findViewById(R.id.scroll);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterReceiver(receiver);
    }

    private class NotificationReceiver extends BroadcastReceiver {
        private static final String TAG = "MyBroadcastReceiver";
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.i(TAG, "Notification action received");
            getDeviceData();
        }
    }

    private Device getSpinnerDevice() {
        if (devices.size() > 0) {
            int pos = 0;
            return devices.get(pos);
        }
        return null;
    }

    private int getChildViewId(ViewGroup parent, int x, int y) {
        View c = null;
        for (int i = 0; i < parent.getChildCount(); i++) {
            View child = parent.getChildAt(i);
            int[] coords = new int[]{0, 0};
            child.getLocationOnScreen(coords);
            Rect bounds = new Rect(coords[0], coords[1],
                    coords[0] + child.getWidth(),coords[1] + child.getHeight());
            if (bounds.contains(x, y)) {
                c = child;
            }
        }
        if (c == null) return -1;

        return c.getId();
    }

    public void layoutDevices(List<Device> devices) {
        this.grid = (ExpandableHeightGridView) this.findViewById(R.id.device_grid);
        this.grid.setExpanded(true);
        this.gridAdapter = new DeviceGridAdapter(this, devices);
        this.grid.setAdapter(this.gridAdapter);
        this.swipeView.setRefreshing(false);

        List<String> deviceNames = new ArrayList<>();
        for (Device d : devices) {
            deviceNames.add(d.name);
        }

        ArrayAdapter<String> adapter =
            new ArrayAdapter<>(this, R.layout.support_simple_spinner_dropdown_item, deviceNames);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);

        this.grid.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Device d = (Device) gridAdapter.getItem(position);
                if (d.state.reachable) {
                    boolean state = !d.state.on;
                    ChangeDeviceStateTask task = new ChangeDeviceStateTask();
                    DeviceStateChange dsc = new DeviceStateChange(d, state);
                    task.execute(dsc);
                }
            }
        });
    }

    @Override
    public void onRefresh() {
        getDeviceData();
    }

    public void setNotificationLimit() {
        for (Device d : devices) {
            setThresholdSingle(d);
        }
    }

    private void setThresholdSingle(Device d) {
        SetLimit task = new SetLimit();
        d.threshold = chart.getLineHeight();
        task.execute(d.id, d.fulcrumId, Float.toString(d.threshold));
    }

    public void getDeviceData() {
        GetDeviceDataTask task = new GetDeviceDataTask();
        task.execute();
    }

    public class GetDeviceDataTask extends AsyncTask<String, Void, List<Device>> {
        private SharedPreferences prefs;
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            this.prefs = getSharedPreferences(getString(R.string.user_id), 0);
        }

        protected List<Device> doInBackground(String... params) {
            String uid = this.prefs.getString(getString(R.string.user_id), null);
            String urlString = getString(R.string.api_base_url) + "devices/" + uid;
            Map<String, String> headers = new HashMap<>();
            headers.put("Token", this.prefs.getString("user_id", ""));
            String data = HttpUtils.get(urlString, headers);
            List<Device> devices = parseDeviceDictionary(data);
            for (Device d : devices) {
                String sql = String.format("INSERT OR REPLACE INTO Devices (_id, FulcrumId, DeviceName) VALUES ('%s', '%s', '%s')",
                        d.id, d.fulcrumId, d.name);
                db.execSQL(sql);
            }
            return devices;
        }

        protected void onPostExecute(List<Device> data) {
            // TODO: display the device data
            devices = data;
            layoutDevices(devices);
            refreshChart();
        }
    }

    private List<Device> parseDeviceDictionary(String data) {
        Map<String, Device> devices;
        Gson g = new Gson();
        devices = g.fromJson(data, new TypeToken<Map<String, Device>>(){}.getType());
        if (devices != null) {
            return new ArrayList<>(devices.values());
        }
        return new ArrayList<>();
    }

    private List<Device> parseDeviceArray(String data) {
        Gson g = new Gson();
        return g.fromJson(data, new TypeToken<List<Device>>(){}.getType());
    }

    private class SetLimit extends AsyncTask<String, Integer, String> {
        private SharedPreferences prefs;

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            this.prefs = getSharedPreferences(getString(R.string.user_id), 0);
        }


        protected String doInBackground(String... params) {
            if (params.length < 3) return "";
            String device = params[0];
            String fulcrum = params[1];
            String limit = params[2];
            String urlString = getString(R.string.api_base_url)
                    + "set_limit/"
                    + fulcrum + "/" + device + "/" + limit;
            Map<String, String> headers = new HashMap<>();
            headers.put("Token", this.prefs.getString("user_id", ""));
            return HttpUtils.post(urlString, null, headers);
        }

        protected void onPostExecute(String data) {
            // Not really anything to do but chill
        }

    }

    public void refreshChart() {
        if (devices.size() > 0) {
            int pos = 0;
            Device d = devices.get(pos);
            MPPointD point = MPPointD.getInstance(0, d.threshold);
            chart.setLineHeight(point);
            if (d.history != null) {
                chart.setData(d.history);
            }
            chart.render();
        }
    }

    public void refreshGrid() {
        this.gridAdapter.notifyDataSetChanged();
    }

    private class ChangeDeviceStateTask extends AsyncTask<DeviceStateChange, Integer, String> {
        private SharedPreferences prefs;
        private Device device;

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            this.prefs = getSharedPreferences(getString(R.string.user_id), 0);
        }

        protected String doInBackground(DeviceStateChange... params) {
            DeviceStateChange ds = params[0];
            this.device = ds.device;
            String fulcrumId = device.fulcrumId;
            String deviceId = device.id;
            String urlString = getString(R.string.api_base_url) + "set_state/" + fulcrumId + "/" + deviceId;
            Map<String, String> body = new HashMap<>();
            body.put("on", Boolean.toString(params[0].on));
            Map<String, String> headers = new HashMap<>();
            headers.put("Token", this.prefs.getString("user_id", ""));
            String bodyString = new Gson().toJson(body);
            return HttpUtils.post(urlString, bodyString, headers);
        }

        protected void onPostExecute(String data) {
            try {
                StateChangeResponse res = new Gson().fromJson(data, StateChangeResponse.class);
                if (res.success) {
                    this.device.state.on = !this.device.state.on;
                } else {
                    this.device.state.reachable = false;
                }
                refreshGrid();
            } catch (IllegalStateException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {
        ViewGroup linearLayout = (ViewGroup) findViewById(R.id.scrollChild);
        int childId = getChildViewId(linearLayout, (int)event.getX(), (int)event.getY());
        switch (event.getAction()) {
            case MotionEvent.ACTION_BUTTON_PRESS:
                settingLineHeight = childId == findViewById(R.id.chart).getId();
                break;
            case MotionEvent.ACTION_MOVE:
                if (!chart.hasData()) {
                    break;
                } else if (childId == findViewById(R.id.chart).getId()) {
                    settingLineHeight = true;
                    scrollView.setEnabled(false);
                    swipeView.setEnabled(false);
                    chart.setLineHeight(event.getY());
                    return true;
                } else if (!scrollView.isEnabled()) {
                    return true;
                }
                break;
            case MotionEvent.ACTION_UP:
                if (settingLineHeight) {
                    settingLineHeight = false;
                    int pos = 0;
                    Device d = devices.get(pos);
                    float height = chart.getLineHeight();
                    d.threshold = height;
                    setNotificationLimit();
                }
                scrollView.setEnabled(true);
                swipeView.setEnabled(true);
                break;
            default: break;
        }
        return super.dispatchTouchEvent(event);
    }
}