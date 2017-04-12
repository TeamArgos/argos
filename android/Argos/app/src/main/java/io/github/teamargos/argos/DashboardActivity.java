package io.github.teamargos.argos;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.GridView;
import android.widget.ListView;
import android.widget.TextView;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

import io.github.teamargos.argos.Models.Device;

public class DashboardActivity extends DrawerActivity {

    private String TAG = "DASHBOARD";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);
        setupDrawer();

//        GridView gv = (GridView) findViewById(R.id.device_grid);
//        gv.setAdapter();

        getDeviceData(null);
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
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;

            String data = null;
            try {

                URL url = new URL(urlString);
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setRequestMethod("GET");
                urlConnection.connect();

                InputStream inputStream = urlConnection.getInputStream();
                StringBuffer buffer = new StringBuffer();
                if (inputStream == null) {
                    Log.d(TAG, "Input stream is null");
                    return null;
                }
                reader = new BufferedReader(new InputStreamReader(inputStream));

                String line = reader.readLine();
                while (line != null) {
                    buffer.append(line + "\n");
                    line = reader.readLine();
                }

                if (buffer.length() == 0) {
                    Log.d(TAG, "Buffer length is 0");
                    return null;
                }
                data = buffer.toString();
            }
            catch (IOException e) {
                Log.d(TAG, e.toString());
                return null;
            }
            finally {
                if (urlConnection != null) {
                    urlConnection.disconnect();
                }
                if (reader != null) {
                    try {
                        reader.close();
                    }
                    catch (IOException e) {
                    }
                }
            }

            return data;
        }

        protected void onPostExecute(String data) {
            // TODO: display the device data
            Map<String, Device> devices = new HashMap<>();
            Gson g = new Gson();
            devices = g.fromJson(data, new TypeToken<Map<String, Device>>(){}.getType());
            Log.d(TAG, data);
        }
    }
}
