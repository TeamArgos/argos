package io.github.teamargos.argos;

import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.GridView;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.github.teamargos.argos.Models.Device;
import io.github.teamargos.argos.Adapters.DeviceGridAdapter;
import io.github.teamargos.argos.Models.DeviceStateChange;
import io.github.teamargos.argos.Models.StateChangeResponse;
import io.github.teamargos.argos.Utils.HttpUtils;

public class DashboardActivity extends DrawerActivity {

    private String TAG = "DASHBOARD";
    private GridView grid;
    private DeviceGridAdapter gridAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);
        setupDrawer();

        getDeviceData(null);
    }

    public void layoutDevices(List<Device> devices) {
        this.grid = (GridView) this.findViewById(R.id.device_grid);
        this.gridAdapter = new DeviceGridAdapter(this, devices);
        this.grid.setAdapter(this.gridAdapter);

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

    public void getDeviceData(View v) {
        GetDeviceDataTask task = new GetDeviceDataTask();
        task.execute();
    }

    public class GetDeviceDataTask extends AsyncTask<String, Void, String> {
        private SharedPreferences prefs;
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            this.prefs = getSharedPreferences(getString(R.string.user_id), 0);
        }

        protected String doInBackground(String... params) {
            String uid = this.prefs.getString(getString(R.string.user_id), null);
            String urlString = getString(R.string.api_base_url) + "devices/" + uid;
            return HttpUtils.get(urlString, null);
        }

        protected void onPostExecute(String data) {
            // TODO: display the device data
            Map<String, Device> devices;
            Gson g = new Gson();
            devices = g.fromJson(data, new TypeToken<Map<String, Device>>(){}.getType());
            layoutDevices(new ArrayList<>(devices.values()));
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
            String bodyString = new Gson().toJson(body);
            return HttpUtils.post(urlString, bodyString, null);
        }

        protected void onPostExecute(String data) {
            System.out.println(data);
            StateChangeResponse res = new Gson().fromJson(data, StateChangeResponse.class);
            if (res.success) {
                this.device.state.on = !this.device.state.on;
                refreshGrid();
            } else {
                this.device.state.reachable = false;
                refreshGrid();
            }
        }
    }
}
