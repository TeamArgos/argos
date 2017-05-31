package io.github.teamargos.argos.Fragments;

import android.app.AlertDialog;
import android.app.Dialog;
import android.app.DialogFragment;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.ContextThemeWrapper;

import io.github.teamargos.argos.R;

/**
 * Created by Jordan on 5/12/17.
 */

public class ChartInfoDialog extends DialogFragment {
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        // Use the Builder class for convenient dialog construction
        AlertDialog.Builder builder = new AlertDialog.Builder(new ContextThemeWrapper(getActivity(), R.style.App_Alert));
        builder.setMessage(R.string.argos_ls_desc).setTitle("Argos Light Score")
                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        // FIRE ZE MISSILES!
                        // ^ lol that's from the Android docs. But we don't need to do anything
                    }
                });
        return builder.create();
    }
}
