<?php include(INCLUDE_PATH . 'email_templates/includes/header.php'); ?>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td>
      <h3>Dear {firstname},</h3>
    </td>
  </tr>
  <tr>
    <td>
      <p>Congratulations, you have been shortlisted for CBT test on the Oyo State Job Portal for {mda_description}.</p>
      <h3>Further information will be sent to you.</h3>
      <p>Form No.: {form_no}
      </p>
      <p><small>
          {website}
        </small></p>
    </td>
  </tr>
</table>
<?php include(INCLUDE_PATH . 'email_templates/includes/footer.php'); ?>