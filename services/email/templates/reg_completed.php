<?php include(INCLUDE_PATH . 'email_templates/includes/header.php'); ?>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td>
      <h3>Dear {firstname},</h3>
    </td>
  </tr>
  <tr>
    <td>
      <p>You have completed the filling of the recruitment form on Oyo State Job Portal for {mda_description}.</p>
      <h3>You can login to your account to view or print your slip</h3>
      <p>Click the link below to print your application slip:</p>
      <p><a href="{slip_link}"></a>Print Slip</p>
      <p>Form No.: {form_no}
      </p>
      <p><small>
          {website}
        </small></p>
    </td>
  </tr>
</table>
<?php include(INCLUDE_PATH . 'email_templates/includes/footer.php'); ?>