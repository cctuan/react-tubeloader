
(function() {



var DownloadItem = React.createClass({
  onCheck: function(evt) {
    var checked = evt.target.checked;
  },
  onDownload: function(evt) {
    var data = this.props.data;
    var target = evt.target;
    $(target).attr('href', data.url)
      .attr('download', escape(data._filename));
  },
  render: function() {
    var data = this.props.data;
    console.log(this.props.data);
    return (
      <li className="list-group-item">
        <input type="checkbox" onChange={this.onCheck} />
        {data.title}
        <a href="#" onClick={this.onDownload}>download</a>
      </li>
    );
  }
});

var DownloadList = React.createClass({
  componentDidMount: function() {
    window.addEventListener('add-download-item', this);
    window.addEventListener('remove-download-item', this);

  },
  handleEvent: function(evt) {
    var data = evt.detail;
    switch(evt.type) {
      case 'add-download-item':
        this.getMusicInfo(data.url);
        break;
      case 'remove-download-item':
        var currentData = this.state.data;
        delete currentData[data.url];
        this.setState({data: currentData});
        break;
    }
  },
  getMusicInfo: function(link) {
    var self = this;
    $.ajax({
      url: 'gettube',
      type: 'GET',
      data: {
        link: link
      },
      success: function(data) {
        var currentData = self.state.data;
        currentData[link] = data;
        self.setState({data: currentData});
      }
    });
  },
  onDownloadClick: function() {
    var allData = this.state.data;
  },
  getInitialState: function() {
    return {data: {}};
  },
  render: function() {
    var downloadItems = [];
    for (var url in this.state.data) {
      downloadItems.push(
        <DownloadItem data={this.state.data[url]} url={url} />
      );
    }
    return (
      <ul className="list-group">
        <li className="list-group-item">
          <button type="button" onClick={this.onDownloadClick}
            className="btn btn-primary btn-lg btn-block">
            Download
          </button>
        </li>
        {downloadItems}
      </ul>
    );
  }
});

var Tube = React.createClass({
  componentDidMount: function() {
    this._onLoaded = false;
    this._onPausing = false;
  },
  getInitialState: function() {
    return {thumb: true, videoSrc: ''};
  },
  onCheck: function(evt) {
    var checked = evt.target.checked;
    switch(checked) {
      case true:
        this._publish('add-download-item', this.props.data);
        break;
      case false:
        this._publish('remove-download-item', this.props.data);
        break;
    }
    console.log(evt.target.checked);
  },
  _publish: function(evtName, detail) {
    var evt = new CustomEvent(evtName, {
      bubbles: true,
      detail: detail || this
    });
    window.dispatchEvent(evt);
  },
  onThumbClick: function(evt) {
    var target = evt.target;
    if (this._onLoaded) {
      var video = React.findDOMNode(this.refs.video);
      if (this._onPausing) {
        target.classList.add('glyphicon-pause');
        target.classList.remove('glyphicon-play');
        video.play();
        this._onPausing = false;
      } else {
        target.classList.add('glyphicon-play');
        target.classList.remove('glyphicon-pause');
        video.pause();
        this._onPausing = true;
      }
      return;
    }
    var self = this;
    var link = this.props.data.url;

    target.classList.add('glyphicon-hourglass');
    target.classList.remove('glyphicon-play');
    $.ajax({
      url: 'gettube',
      type: 'GET',
      data: {
        link: link
      },
      success: function(data) {
        target.classList.remove('glyphicon-hourglass');
        target.classList.add('glyphicon-pause');

        self.setState({thumb: false, videoSrc: data.url});
        self._onLoaded = true;
        self._onPausing = false;
      }
    });
  },
  render: function() {
    var data = this.props.data;

    return (
      <div className="col-lg-3 col-md-4 col-xs-6 thumb">
        <input onChange={this.onCheck} type="checkbox" />
        <span className="video-control-icon glyphicon glyphicon-play"
          onClick={this.onThumbClick} />
        <a className="thumbnail">
        { this.state.thumb ?
            <img className="img-responsive" src={data.thumbnails[3].url}
              alt=""/> :
            <video autoPlay src={this.state.videoSrc} ref="video"></video>
        }
        </a>
      </div>
    );
  }
});

var InputBox = React.createClass({
  componentDidMount: function() {
    var self = this;
    var node = React.findDOMNode(this.refs.searchInput);
    $(node).autocomplete({
      source: function(req, res) {
        $.ajax({
          url: 'autocomplete/' + req.term,
          dataType: "jsonp",
          type: 'GET',
          data: {
            term: req.term
          },
          success: function(data) {
            self.props.onUpdate(data);
          }
        })
      }
    });
  },
  render: function() {
    return (
      <div className='col-lg-12 ui-widget search-song-input-container'>
        <input id="search-song-input" ref="searchInput" />
      </div>
    );
  }
});

var TubeBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  onUpdate: function(data) {
    this.setState({data: data});
  },
  render: function() {
    var tubeNodes = this.state.data.map(function(tube) {
      return (
        <Tube data={tube} />
      );
    });
    return (
      <div className='col-lg-12'>
        <div className='row songs-container col-lg-9'>
          <InputBox onUpdate={this.onUpdate} />
          {tubeNodes}
        </div>
        <div className="row col-lg-3">
          <DownloadList />
        </div>
      </div>
    );
  }
});

//var widget = new Widget();
//widget.start();

React.render(
  <TubeBox />,
  document.getElementById('container')
);

})(window);
