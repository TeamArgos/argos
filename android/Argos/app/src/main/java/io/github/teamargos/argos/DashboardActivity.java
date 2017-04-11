package io.github.teamargos.argos;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

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
        setContentView(R.layout.activity_dashboard);
        super.onCreate(savedInstanceState);
    }


    public void doTest(View button) {
        Log.d(TAG, "Button clicked");
//        GetDataTestTask task = new GetDataTestTask();
//        task.execute();
        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
    }

    public class GetDataTestTask extends AsyncTask<String, Void, String> {
        protected String doInBackground(String... params) {
            String urlString = "https://jsonplaceholder.typicode.com/posts/1";
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
                    return null;
                }
                reader = new BufferedReader(new InputStreamReader(inputStream));

                String line = reader.readLine();
                while (line != null) {
                    buffer.append(line + "\n");
                    line = reader.readLine();
                }

                if (buffer.length() == 0) {
                    return null;
                }
                data = buffer.toString();
            }
            catch (IOException e) {
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
            Log.d("MAIN", data);
        }
    }
}
