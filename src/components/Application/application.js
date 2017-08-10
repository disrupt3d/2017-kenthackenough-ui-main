import Vue from 'vue';

import template from './application.html';
import Grid from 'components/grid/grid';
import Dropzone from 'vue2-dropzone';

import Person from 'components/Person/person';

import Ogre from 'components/Ogre/ogre';
import Ent from 'components/Ent/ent';

import './application.scss';
import { API_BASE } from 'src/config/constants';

var keys = {
  UP: 38,
  LEFT: 37,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
  P: 80,
  ESC: 27,
  ENTER: 13,
    
  H: 72 // HURTS ENEMY
};

export default Vue.extend({
  template,

  components: {
    Grid,
    Person,
    Ogre,
    Ent,
    Dropzone
  },

  data() {
    return {
      monsters: ['ogre', 'ent'],
      monster: 'none',
      slash: false,
      slashTime: 10,
      slashCount: 0,
      
      schools: ['Kent', 'Akron', 'Case'],
      genders: ['Male', 'Female'],
      resumeUrl: '',

      scalingObject: {
        transform: ''
      },

      other: {
        year: false,
      },

      currentFieldIndex: -1,
    };
  },

  methods: {
    move(){
      if (this.slash) {
        this.slashCount++;
        if (this.slashCount >= this.slashTime) {
          this.slash = false;
          console.log(this.slash);
        }
      } else {
        this.slashCount = 0;
      }
        
      if (this.monster === 'none') {
        this.newMonster();
        console.log('Monster type:' + this.monster);
      }
        
      this.$refs.you.animate();
      if (this.monster === 'ogre' && this.$refs.appOgre !== undefined) {
        this.$refs.appOgre.animate();
      } else if (this.monster === 'ent' && this.$refs.appEnt !== undefined){
        this.$refs.appEnt.animate();
      }
        
      if (this.paused) {
        this.paused = true;
        return;
      }
      this.paused = false;
        
      if (this.$refs.you.xLHS > 275) {
        this.$refs.you.moveLeft();
      }
      if (keys[keys.UP]) {
        this.$refs.you.jumpUp();
      }
      if (keys[keys.DOWN]) {
        return;
      }
      if (keys[keys.H]) {
        this.hurtMonster();
      }
    },
      
    newMonster() {
      if (this.$refs.you.win) {
        return;
      }
      this.monster = 'none';
      var i = Math.floor(Math.random() * this.monsters.length);
      this.monster = this.monsters[i];
    },
      
    hurtMonster(amount) {
      if (this.monster === 'ogre' && this.$refs.appOgre !== undefined) {
        this.$refs.appOgre.hurt(amount);
      }
      if (this.monster === 'ent' && this.$refs.appEnt !== undefined) {
        this.$refs.appEnt.hurt(amount);
      }
    },
      
    doResize() {
      console.log('doREsize called');
      var scale;

      var wrapperWidth = document.documentElement.clientWidth;
      var wrapperHeight = document.documentElement.clientHeight;

      // Use Math.min if you want to scale so that the width fills the screen.
      // Math.max fills the height
      scale = wrapperHeight / this.$refs.scalingContainer.clientHeight;
      // scale = Math.max(
      //   wrapperWidth / this.$el.clientWidth,
      //   wrapperHeight / this.$el.clientHeight
      // );
      console.log('scale:' + scale, 'elWidth', this.$refs.scalingContainer.clientWidth, '$wrapper.width()' + wrapperWidth);
      this.scalingObject = {
        //Keeps container centered
        transform: 'translateX(' + (-(scale * this.$refs.scalingContainer.clientWidth) / 2 + (wrapperWidth / 2)) + 'px) ' + 'scale(' + scale + ')'
      };

    },

    sourceChanged() {
      // console.log('source = ' + this.$root.$data.user.application.school + ' new value = ' + e.target.value);
      // var newSource = e.target.value;

      // only action if value is different from current deepSource
      // if (newSource!= this.deepSchool) {
      //   for (var i=0; i<this.schools.length; i++) {
      //     if (this.schools[i] == newSource) {
      //       this.deepSchool = this.schools[i];
      //       this.school = this.deepSchool;
      //     }
      //   }
      // }
    },

    goToNextField() {
      this.currentFieldIndex += 1;
      console.log('index: ' + this.currentFieldIndex);
      if (this.currentFieldIndex === 15) {
        this.$refs.you.win = true;
        console.log('win status: ' + this.$refs.you.win);
        
      }

      this.hurtMonster(2000);
    },

    handleKeypress(e) {
      if (e.keyCode === keys.ENTER) {
        this.goToNextField();
      } else if ((e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 48 && e.keyCode < 57)) { // Letter keys
        this.hurtMonster();
        // Shake screen todo
      }
    },

    submitApplication() {
      this.$root.createApplication()
      .then((response) => {
        console.log('response', response.data);
        this.goToNextField();
      })
      .catch((error) => {
        this.goToNextField();
        console.log('Error', error);
      });
    },

    updateApplication() {
      this.$root.updateApplication()
      .then((response) => {
        console.log('response', response.data);
      })
      .catch((error) => {
        console.log('Error', error);
      });
    },

    resumeSuccess(response) {
      console.log('Successfully uploaded', response);
    },

    resumeError(error) {
      console.log('Error uploading resume', error);
    },
  },

  mounted: function() {
      
    this.$refs.you.xLHS = 600;
    window.addEventListener('resize', this.doResize);
    this.doResize();
      
    this.newMonster();
      
    // Movement detection
    //var self = this;
    window.addEventListener('keydown', function(e){
      keys[e.keyCode || e.which] = true;
      if (e.keyCode === Number(keys.ESC)) {
        return;
      }
    }, true);

    window.addEventListener('keyup', function(e){
      keys[e.keyCode || e.which] = false;
    }, true);
      
    setInterval(this.move, 10);

    var self = this;
    setTimeout(() => {
      self.currentFieldIndex = 13;
    }, 100);
    setTimeout(() => {
      self.currentFieldIndex += 1;
    }, 3000);

    this.resumeUrl = `${API_BASE}/users/application/resume`;
  }

});
