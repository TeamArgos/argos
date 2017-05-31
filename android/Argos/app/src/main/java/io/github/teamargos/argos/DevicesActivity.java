package io.github.teamargos.argos;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.util.ArrayList;
import java.util.Map;

import io.github.teamargos.argos.Models.Device;
import io.github.teamargos.argos.Utils.HttpUtils;

public class DevicesActivity extends AppCompatActivity {
    String TAG = "DEVICES";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_devices);

        Toolbar mToolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(mToolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setDisplayShowTitleEnabled(false);


        getDeviceData(null);
    }

    public boolean onOptionsItemSelected(MenuItem item) {
        Intent dash = new Intent(this, DashboardActivity.class);
        startActivity(dash);
        return true;
    }

    public void getDeviceData(View v) {
        DevicesActivity.GetDeviceDataTask task = new DevicesActivity.GetDeviceDataTask();
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
            Log.d(TAG, "onPostExecute: " + data);
            // TODO: display the device data
            Map<String, Device> devices;
            Gson g = new Gson();
            devices = g.fromJson(data, new TypeToken<Map<String, Device>>(){}.getType());
        }
    }
}
