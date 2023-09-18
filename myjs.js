const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'QuangNguyen';

const namePlayingSong = $('.song-name');
const cd = $('.cd');
const cd_player = $('.cd-player');
const audio = $('#audio');
const togglePlay = $('.btn.btn-play');
const player = $('.player');
const playBtn = $('.btn.btn-toggle-play');
const progress = $('.progress');
const nextBtn = $('.btn.btn-next-song');
const prevBtn = $('.btn.btn-previous-song');
const replayBtn = $('.btn.btn-replay');
const shuffleBtn = $('.btn.btn-shuffle');
const playlist = $(".play-list");
const timeline = $('.curr-time');

const app = {
  isShuffleActive : false,
  isReplayActive : false,
  isPlaying : false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  currentIndex : 0,
  shufflePlayed: [
  ],

  setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  songs: [
    {
      name: "Cruel Summer",
      singer: "Taylor Swift",
      path: "./music/cruel-summer.mp3",
      image: "./Image/Cruel Summer.jpg",
    },
    {
      name: "Daylight",
      singer: "Taylor Swift",
      path: "./music/daylight.mp3",
      image: "./Image/Cruel Summer.jpg",
    },
    {
      name: "A Little Piece Of Heaven",
      singer: "Avenged Sevenfold",
      path: "./music/a-little-piece-of-heaven.mp3",
      image: "./Image/QuangNguyen.jpg",
    },
    {
      name: "Iu Thu Hà nhất trên đời",
      singer: "Quang Nguyễn",
      path: "./music/vung-dat-linh-hon.mp3",
      image: "./Image/lover.jpg",
    },
    {
      name: "Sparks Fly",
      singer: "Taylor Swift",
      path: "./music/sparks-fly.mp3",
      image: "./Image/ThuHa.jpg",
    },
    {
      name: "Illicit Affairs",
      singer: "Taylor Swift",
      path: "./music/IllicitAffairs.mp3",
      image: "./Image/folklore.jpg",
    },
    {
      name: "Betty",
      singer: "Taylor Swift",
      path: "./music/Betty.mp3",
      image: "./Image/folklore.jpg",
    },
  ],

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
      <div class="song ${this.currentIndex === index ? 'active' : ''}" data-index = "${index}">
        <div class="thumb" style="background-image: url('${song.image}')"></div>
        <div class="body">
          <h3 class="title">${song.name}</h3>
          <p class="author">${song.singer}</p>
        </div>
        <div class="option">
          <i class="fa-solid fa-ellipsis"></i>
        </div>
      </div>
      `;
    });
    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function() {
    Object.defineProperty(this, 'currentSong', {
      get: function() {
        return this.songs[this.currentIndex];
      }
    })
  },

  handleEvents: function() {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    const cdPlayerAnimate = cd_player.animate([
      {transform: 'rotate(360deg)'}
    ], {
      duration: 10000,
      iterations: Infinity 
    })

    cdPlayerAnimate.pause();

    document.onscroll = function() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newWidth = cdWidth - scrollTop;
      const cdOpacity = newWidth / cdWidth;
      cd.style.width = newWidth > 0 ? newWidth + 'px' : 0;
      cd.style.opacity = cdOpacity;
    }

    playBtn.onclick = function() {
      if(_this.isPlaying) {
        audio.pause();
      }
      else {
        audio.play();
      }
    }

    audio.onloadedmetadata = function() {
        const m = Math.floor((audio.duration / 60) % 60); 
        const s = Math.floor(audio.duration % 60);
        var minute;
        var second;
        second = s < 10 ? '0' + s : s;
        minute = m < 10 ? '0' + m : m; 
        $('.total-time').innerHTML = minute + ':' + second;
    }

    audio.onplay = function() {
      cdPlayerAnimate.play();
      player.classList.add('playing');
      _this.isPlaying = true;
      _this.render();
      _this.scrollToActive();
    }

    audio.onpause = function() {
      cdPlayerAnimate.pause();
      _this.isPlaying = false;
      player.classList.remove('playing');
    }

    audio.ontimeupdate = function() {
      if(audio.duration) {
        // progress.setAttribute("value", Math.floor((audio.currentTime / audio.duration) * 100)); // cant understand why is this get bug at progress.onchange
        percentProgressValue = Math.floor((audio.currentTime / audio.duration) * 100);
        progress.value = percentProgressValue;
      }
      //timeline
      const m = Math.floor((audio.currentTime / 60) % 60); 
      const s = Math.floor(audio.currentTime % 60);
      var minute;
      var second;
      second = s < 10 ? '0' + s : s;
      minute = m < 10 ? '0' + m : m; 
      timeline.innerHTML = minute + ':' + second;
    }

    progress.oninput = function() {
      const poss = progress.value;
      audio.currentTime = (poss * audio.duration) / 100;
    }

    nextBtn.onclick = function() {
      if(_this.isShuffleActive)
        _this.chooseSong();
      else
        _this.loadNextSong();
      audio.play();
    }

    prevBtn.onclick = function() {
      if(_this.isShuffleActive)
        _this.chooseSong();
      else
        _this.loadPrevSong();
      audio.play();
    }

    replayBtn.onclick = function() {
      _this.toggleReplaySong();
    }

    shuffleBtn.onclick = function() {
      _this.toggleShuffleSong();
    }

    audio.onended = function() {
      _this.chooseSong();
      audio.play();
    }
    
    playlist.onclick = function(e) {
      const songNode = e.target.closest('.song:not(.active)');
      const songOption = e.target.closest('.option');
      if(songNode || songOption) {
        if(songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          audio.play();
        }
        if(songOption) {
          console.log(e.target)
        }
      }
    }
  },

  scrollToActive: function() {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: "smooth", 
        block: "end",
        inline: "nearest"
      })
    }, 250)
  },

  loadCurrentSong: function() {
    // console.log(this.currentIndex);
    namePlayingSong.innerHTML = this.currentSong.name;
    cd_player.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;
  },

  loadConfig: function() {
    if(this.config.isReplayActive != undefined) {
      this.isReplayActive = this.config.isReplayActive;
    }
    if(this.config.isShuffleActive != undefined) {
      this.isShuffleActive = this.config.isShuffleActive;
    }
  },

  loadNextSong: function() {
    this.currentIndex++;
    if(this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  loadPrevSong: function() {
    if(this.currentIndex > 0)
      this.currentIndex--;
    else {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  toggleReplaySong: function() {
    this.isReplayActive = !this.isReplayActive;
    replayBtn.classList.toggle('active', this.isReplayActive);
    this.setConfig('isReplayActive', this.isReplayActive);
    // if(!this.isReplayActive) {
    //   this.isReplayActive = true;
    //   replayBtn.classList.add("active");
    // }
    // else {
    //   this.isReplayActive = false;
    //   replayBtn.classList.remove("active");
    // }
  },
  
  toggleShuffleSong: function() {
    // if(!this.isShuffleActive) {
    //   this.isShuffleActive = true;
    //   shuffleBtn.classList.add("active");
    // }
    // else {
    //   this.isShuffleActive = false;
    //   shuffleBtn.classList.remove("active");
    //   this.shufflePlayed.length = 0;
    // }
    this.isShuffleActive = !this.isShuffleActive;
    if(this.isShuffleActive == false) {
      this.shufflePlayed.length = 0;
    }
    shuffleBtn.classList.toggle('active', this.isShuffleActive);
    this.setConfig('isShuffleActive', this.isShuffleActive);
  },

  chooseSong: function() {
    if(this.isReplayActive) {
      this.loadCurrentSong();
    }
    else if(!this.isShuffleActive) {
      this.loadNextSong();
    }
    else if(this.isShuffleActive){
      if (this.songs.length == this.shufflePlayed.length) {
        this.shufflePlayed.length = 0;
      }
      do {
        randomIndex = Math.floor(Math.random() * this.songs.length);
      } while(this.currentIndex == randomIndex || this.shufflePlayed.includes(randomIndex));
      this.currentIndex = randomIndex;
      this.shufflePlayed.push(this.currentIndex);
      // console.log(this.shufflePlayed);
      this.loadCurrentSong();
    }
  },

  start: function () {
    this.loadConfig();

    this.defineProperties();

    this.handleEvents();
    
    this.loadCurrentSong();
    
    replayBtn.classList.toggle('active', this.isReplayActive);
    shuffleBtn.classList.toggle('active', this.isShuffleActive);

    this.render();
  },
};

app.start();
