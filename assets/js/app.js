(function() {
	$(document).foundation();
    $("#content :header:not(h1)").each(function() {
        var $this = $(this);
        var id = $this.text().toLowerCase().replace(/[^0-9a-z_.-\:]/g, "-");
        if (document.getElementById(id)) {
            id = id + "-" + (+(/-(\d+)$/.exec(id) || ["", "0"])[1] + 1);
        }
        $this.attr("id", id);
    });
})();