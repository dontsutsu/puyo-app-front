const gulp = require("gulp");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const sass = require('gulp-sass')(require('sass'));

gulp.task("ejs", (done) => {
	gulp
		.src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
		.pipe(ejs({}, {}, { ext: ".html" }))
		.pipe(rename({ extname: ".html" }))
		.pipe(gulp.dest("dist"));
	done();
});

gulp.task("sass", (done) => {
	gulp
		.src("src/sass/**/*.scss")
		.pipe(sass({outputStyle: "expanded"}))
		.pipe(gulp.dest("dist/static/css"));
	done();
});