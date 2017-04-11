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
import android.widget.ListView;
import android.widget.TextView;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class DashboardActivity extends DrawerActivity {

    private String TAG = "DASHBOARD";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        setupDrawer();
    }

    public void testSignIn(View v) {
        GetDataTestTask task = new GetDataTestTask();
        task.execute();
    }

    public class GetDataTestTask extends AsyncTask<String, Void, String> {
        private SharedPreferences prefs;
        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            this.prefs = getSharedPreferences(getString(R.string.user_id), 0);
        }

        protected String doInBackground(String... params) {
            String urlString = getString(R.string.api_base_url) + "sign_in";
            HttpURLConnection urlConnection = null;
            BufferedReader reader = null;

            String data = null;
            try {

                URL url = new URL(urlString);
                urlConnection = (HttpURLConnection) url.openConnection();
                urlConnection.setRequestMethod("GET");

                // TODO: replace with data from inputs
                byte[] auth = ("alexbieg95@gmail.com:cooper03").getBytes("UTF-8");

                String encoded = new String(Base64.encode(auth, 0));
                urlConnection.setRequestProperty("Authorization", "Basic "+ encoded);

                urlConnection.connect();

                InputStream inputStream = urlConnection.getInputStream();
                StringBuffer buffer = new StringBuffer();
                if (inputStream == null) {
                    Log.d("MAIN", "Input stream is null");
                    return null;
                }
                reader = new BufferedReader(new InputStreamReader(inputStream));

                String line = reader.readLine();
                while (line != null) {
                    buffer.append(line + "\n");
                    line = reader.readLine();
                }

                if (buffer.length() == 0) {
                    Log.d("MAIN", "Buffer length is 0");
                    return null;
                }
                data = buffer.toString();
            }
            catch (IOException e) {
                Log.d("MAIN", e.toString());
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
//
            try {
                JSONObject json = new JSONObject(data);
                String uid = json.getString("uid");

                SharedPreferences.Editor editor = this.prefs.edit();
                editor.putString(getString(R.string.user_id), uid);

                Log.d("MAIN", uid);
            } catch (JSONException e) {
                e.printStackTrace();
            }

        }
    }
}
