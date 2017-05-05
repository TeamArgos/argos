package io.github.teamargos.argos;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

/**
 * Created by alexb on 4/10/2017.
 *
 * An activity that should be extended to add a drawer to another activity.
 */

public class DrawerActivity extends ArgosBaseActivity {

    private String TAG = "DRAWER";

    private String[] mNavTitles;
    private DrawerLayout mDrawerLayout;
    private ListView mDrawerList;


    public void setupDrawer() {
        // Setup toolbar
        Toolbar mToolbar = (Toolbar) findViewById(R.id.toolbar);
        setToolbarFont(mToolbar, R.id.ToolbarTitle);
        setSupportActionBar(mToolbar);
        getSupportActionBar().setDisplayShowTitleEnabled(false);

        // Add hamburger menu
        mDrawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle mDrawerToggle = new ActionBarDrawerToggle(
                this,  mDrawerLayout, mToolbar,
                R.string.navigation_drawer_open, R.string.navigation_drawer_close
        );
        mDrawerLayout.addDrawerListener(mDrawerToggle);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        getSupportActionBar().setHomeButtonEnabled(true);
        mDrawerToggle.syncState();

        // Add slideout menu options
        mNavTitles = getResources().getStringArray(R.array.nav_titles);
        mDrawerList = (ListView) findViewById(R.id.left_drawer);

        // Set the adapter for the list view
        mDrawerList.setAdapter(new ArrayAdapter<String>(this,
                R.layout.drawer_list_item, mNavTitles));
        // Set the list's click listener
        mDrawerList.setOnItemClickListener(new DrawerItemClickListener(this));
    }

    /* The click listner for ListView in the navigation drawer */
    private class DrawerItemClickListener implements ListView.OnItemClickListener {

        private Context context;

        public DrawerItemClickListener(Context context) {
            this.context = context;
        }

        @Override
        /**
         * When a list item is clicked this function will handle it.
         */
        public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
            String selected = ((TextView)view).getText().toString().toLowerCase();
            mDrawerList.clearChoices();

            switch (selected){
                case "sign out":
                    SharedPreferences prefs = this.context.getSharedPreferences(getString(R.string.user_id), 0);
                    SharedPreferences.Editor editor = prefs.edit();
                    editor.remove(getString(R.string.user_id));
                    editor.commit();

                    Intent signOut = new Intent(this.context, LoginActivity.class);
                    startActivity(signOut);
                    break;
                case "pair":
                    Intent pair = new Intent(this.context, FulcrumPairActivity.class);
                    startActivity(pair);
                    break;
                case "devices":
                    Intent devices = new Intent(this.context, DevicesActivity.class);
                    startActivity(devices);
                case "notifications":
                    Intent nots = new Intent(this.context, NotificationsActivity.class);
                    startActivity(nots);
            }
            mDrawerLayout.closeDrawers();
        }
    }
}
