
/*
 Template Name: Agroxa - Responsive Bootstrap 4 Admin Dashboard
 Author: Themesbrand
 File: Dashboard init js
 */

!function ($) {
    "use strict";

    var Dashboard = function () { };

    //creates area chart
    Dashboard.prototype.createAreaChart = function (element, pointSize, lineWidth, data, xkey, ykeys, labels, lineColors) {
        Morris.Area({
            element: element,
            pointSize: 0,
            lineWidth: 0,
            data: data,
            xkey: xkey,
            ykeys: ykeys,
            labels: labels,
            resize: true,
            gridLineColor: '#eee',
            hideHover: 'auto',
            lineColors: lineColors,
            fillOpacity: .7,
            behaveLikeLine: true,
            parseTime: false
        });
    },

        //creates Donut chart
        Dashboard.prototype.createDonutChart = function (element, data, colors) {
            Morris.Donut({
                element: element,
                data: data,
                resize: true,
                colors: colors
            });
        },

        //pie
        $('.peity-pie').each(function () {
            $(this).peity("pie", $(this).data());
        });

    //donut
    $('.peity-donut').each(function () {
        $(this).peity("donut", $(this).data());
    });



    Dashboard.prototype.init = function () {

    },
        //init
        $.Dashboard = new Dashboard, $.Dashboard.Constructor = Dashboard

    function toDate(fullDate) {
        var yyyy = fullDate.getFullYear()
        var MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : ("0" + (fullDate.getMonth() + 1))
        var dd = fullDate.getDate() < 10 ? ("0" + fullDate.getDate()) : fullDate.getDate()
        return yyyy + '' + MM + '' + dd
    }

    function bytesToSize(bytes) {
        if (bytes === 0) return '0 B';
        let k = 1024,
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    }

    function sync() {
        //loading  api data
        let chain='Polkadot'
        $.get("./stat/dashboard", function (data) {
            if (0 == data.code) {
                var today = new Date()
                var date = toDate(today)
                let total_requests=0
                let total_bandwidth=0
                
                for( let c in data.data[date]){
                    total_requests+=parseInt(data.data[date][c].total_requests)
                    total_bandwidth+=parseInt(data.data[date][c].total_bandwidth)
                }
                if (data.data[date]) {
                    $('#request').html(total_requests)
                    $('#bandwidth').html(bytesToSize(total_bandwidth))
                    $('#delay').html(data.data[date][chain].total_delay + ' ms')
                    $('#timeout').html(data.data[date][chain].total_timeout)

                    var $donutData = []
                    for (var m in data.data[date][chain].total_method) {
                        $donutData.push({ label: m, value: data.data[date][chain].total_method[m] })
                    }
                    $('#morris-donut-example').empty()
                    $.Dashboard.createDonutChart('morris-donut-example', $donutData, ['#f0f1f4', '#f16c69', '#28bbe3']);
                }

                var $areaData = [];
                for (var d in data.data) {
                    $areaData.push({ x: d.substr(4).replace(/(\d\d)/,'$1-'), a: data.data[d][chain].total_requests })
                }
                $('#morris-area-example').empty()
                $.Dashboard.createAreaChart('morris-area-example', 0, 0, $areaData, 'x', ['a'], ['Requests ', 'Bandwitdth'], ['#f16c69', '#ccc']);


            }
        })

        $.get("./stat/requests", function (data) {
            if (0 == data.code) {
                var requests = []
                for (var i = 0; i < data.data.length; i++) {
                    if (!data.data[i].protocol)
                        continue

                    var time = new Date()
                    time.setTime(data.data[i].start)
                    data.data[i].start = time.toLocaleString()

                    if (data.data[i].header && data.data[i].header['origin'])
                        data.data[i].origin = data.data[i].header['origin']
                    if (data.data[i].header && data.data[i].header['user-agent'])
                        data.data[i].agent = data.data[i].header['user-agent']

                    data.data[i].bandwidth = bytesToSize(data.data[i].bandwidth)

                    requests.push(data.data[i])
                }
                var html = template("requests", requests)
                $("#tbody-requests").html(html)
            }
        })
    }
    setInterval(function () {
        sync()
    }, 5000)
    sync()

}(window.jQuery),

    //initializing 
    function ($) {
        "use strict";
        $.Dashboard.init();
    }(window.jQuery);