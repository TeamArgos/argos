package io.github.teamargos.argos;

import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteDatabaseLockedException;
import android.database.sqlite.SQLiteTransactionListener;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.constraint.solver.SolverVariable;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListAdapter;
import android.widget.Spinner;

import com.github.mikephil.charting.charts.LineChart;
import com.github.mikephil.charting.data.Entry;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import io.github.teamargos.argos.Charts.EnergyChart;
import io.github.teamargos.argos.Models.Device;
import io.github.teamargos.argos.Models.EnergyUsage;
import io.github.teamargos.argos.Utils.HttpUtils;

public class EnergyActivity extends ArgosBaseActivity {
    private SQLiteDatabase db;
    private EnergyChart chart;
    private SharedPreferences prefs;
    private Spinner stateSpinner;
    private Spinner deviceSpinner;
    private Map<String, Device> devices;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_energy);
        prefs = getSharedPreferences(getString(R.string.user_id), 0);
        prefs.getString("energy_state", "");
        db = openOrCreateDatabase("ArgosDb",MODE_PRIVATE,null);

        deviceSpinner = (Spinner)findViewById(R.id.energyDeviceSpinner);
        stateSpinner = (Spinner)findViewById(R.id.energyStateSpinner);
        this.devices = getDevices();
        initSpinners();
        getSpinnerState("state");
        getSpinnerState("device");

        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setToolbarFont(toolbar, R.id.ToolbarTitle);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayShowTitleEnabled(false);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setDisplayShowHomeEnabled(true);
        LineChart lc = (LineChart)findViewById(R.id.chart);
        chart = new EnergyChart(this, lc);
        getEnergyData();
    }

    private void initSpinners() {
        String[] states = getResources().getStringArray(R.array.states);
        stateSpinner.setAdapter(new ArrayAdapter<String>(this, android.R.layout.simple_spinner_dropdown_item, states));
        updateDeviceSpinner();

        deviceSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                saveSpinnerState("device");
                getEnergyData();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        stateSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                saveSpinnerState("state");
                getEnergyData();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void saveSpinnerState(String type) {
        Spinner s;
        switch (type) {
            case "device":
                s = deviceSpinner;
                break;
            case "state":
                s = stateSpinner;
                break;
            default: return;
        }
        prefs.edit().putString(type + "_spinner", (String)s.getSelectedItem()).commit();
    }

    private void getSpinnerState(String type) {
        Spinner s;
        switch (type) {
            case "device":
                s = deviceSpinner;
                break;
            case "state":
                s = stateSpinner;
                break;
            default: return;
        }
        String setting = prefs.getString(type + "_spinner", "");
        for (int i = 0; i < s.getCount(); i++) {
            String item = (String)s.getItemAtPosition(i);
            if (item.equals(setting)) {
                s.setSelection(i);
                break;
            }
        }
    }

    private void updateDeviceSpinner() {
        List<String> deviceNames = new ArrayList<>();
        deviceNames.add("All Devices");
        for (Device d : devices.values()) {
            deviceNames.add(d.name);
        }
        deviceSpinner.setAdapter(new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item,
                deviceNames));
    }

    private void getEnergyData() {
        GetEnergyUsage task = new GetEnergyUsage();
        String state = (String)stateSpinner.getSelectedItem();
        String deviceName = (String)deviceSpinner.getSelectedItem();
        task.execute(state, deviceName);
    }

    private Map<String, Device> getDevices() {
        Cursor c = db.rawQuery("SELECT * FROM Devices", null);
        c.moveToFirst();
        Map<String, Device> devices = new LinkedHashMap<>();
        do {
            Device d = new Device();
            d.id = c.getString(0);
            d.fulcrumId = c.getString(1);
            d.name = c.getString(2);
            devices.put(d.name, d);
        } while (c.moveToNext());
        return devices;
    }

    private class GetEnergyUsage extends AsyncTask<String, Void, String> {
        private SharedPreferences prefs;
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            this.prefs = getSharedPreferences(getString(R.string.user_id), 0);
        }

        @Override
        protected String doInBackground(String... params) {
            String state = params[0];
            String deviceName = params[1];
            List<Map<String, String>> deviceBodies = new ArrayList<>();
            List<String> names = new ArrayList<>();

            if (deviceName.equals("All Devices")) {
                names.addAll(devices.keySet());
            } else {
                names.add(deviceName);
            }

            for (String n : names) {
                Device d = devices.get(n);
                Map<String, String> b = new HashMap<>();
                b.put("fulcrumId", d.fulcrumId);
                b.put("id", d.id);
                deviceBodies.add(b);
            }

            String uid = this.prefs.getString("user_id", "");
            String urlString = getString(R.string.api_base_url)
                    + "energy_usage/" + uid + "/";
            try {
                urlString += URLEncoder.encode(state, "UTF-8");
            } catch (Exception e) {}

            Map<String, List<Map<String, String>>> body = new HashMap<>();
            body.put("devices", deviceBodies);
            Gson g = new Gson();
            String b = g.toJson(body);
            String res = HttpUtils.post(urlString, b, null);
            System.out.println(res);
            return res;
        }

        @Override
        protected void onPostExecute(String data) {
            Gson g = new Gson();
            long min = Long.MAX_VALUE;
            Type token =
                    new TypeToken<Map<String, List<EnergyUsage>>>(){}.getType();
            Map<String, List<EnergyUsage>> res = g.fromJson(data, token);
            List<Double> costs = new ArrayList<>();
            List<Long> points = new ArrayList<>();
            for (List<EnergyUsage> usages : res.values()) {
                for (int i = 0; i < usages.size(); i++) {
                    if (costs.size() - 1 < i) {
                        EnergyUsage eu = usages.get(i);
                        costs.add(eu.cost);
                        points.add(eu.timestamp);
                        if (eu.timestamp < min) min = eu.timestamp;
                    } else {
                        costs.set(i, costs.get(i) + usages.get(i).cost);
                    }
                }
            }
            chart.setData(points, costs, min);
            chart.render();
        }
    }
}
