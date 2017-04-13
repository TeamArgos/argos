package io.github.teamargos.argos.Utils;

import android.util.Log;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

import static android.content.ContentValues.TAG;

/**
 * Created by jordan on 4/12/17.
 */

public class HttpUtils {
    public static String get(String urlString, Map<String, String> headers) {
        return genericRequest(urlString, "GET", null, headers);
    }

    public static String post(String url, String body, Map<String, String> headers) {
        return genericRequest(url, "POST", body, headers);
    }

    private static String genericRequest(String urlString, String method, String body, Map<String, String> headers) {
        HttpURLConnection urlConnection = null;
        String data = null;

        try {
            URL url = new URL(urlString);
            urlConnection = (HttpURLConnection) url.openConnection();
            urlConnection.setRequestMethod(method);
            urlConnection.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            if (body != null) {
                OutputStream os = urlConnection.getOutputStream();
                os.write(body.getBytes("UTF-8"));
                os.close();
            }
            urlConnection.connect();
            InputStream inputStream = urlConnection.getInputStream();
            data = parseResponse(inputStream);
        } catch (IOException e) {
            Log.w(TAG, e.toString());
        } finally {
            if (urlConnection != null) {
                urlConnection.disconnect();
            }
        }

        return data;
    }

    private static String parseResponse(InputStream is) {
        BufferedReader reader = null;

        String data = null;
        try {
            if (is == null) {
                Log.d(TAG, "Input stream is null");
                return null;
            }
            reader = new BufferedReader(new InputStreamReader(is));
            StringBuffer buffer = new StringBuffer();
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
        } catch (IOException e) {
            Log.d(TAG, e.toString());
            return null;
        } finally {
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
}
