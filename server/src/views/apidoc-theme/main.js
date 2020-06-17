$(function() {
    $("table:not(.table)").addClass('table table-bordered');

    $.get('version.txt', function(versionContent) {
        $('#version-number').text(versionContent);
    })
});
