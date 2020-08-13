const gulp = require("gulp");
const sass = require("gulp-sass");
const once = require('gulp-once');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

gulp.task("html", () => {
  return gulp
    .src(["app/**/*.html", "!app/**/_*.html"])
    .pipe(gulp.dest("dist/"));
});

gulp.task("ts", () => {
  return gulp
    .src(["app/**/*.ts", "!app/**/_*.ts"])
    .pipe(tsProject())
    .js.pipe(once())
    .pipe(gulp.dest("dist/"));
});
// Task for hotswapping files
// TODO: clear out dist, maybe even pipe files into a seperate folder
gulp.task("sosts", () => {
  return gulp
    .src(["app/**/*.ts", "!app/**/_*.ts"])
    .pipe(tsProject())
    .js.pipe(gulp.dest("dist/"));
});

gulp.task("sass", () => {
  return gulp.src("app/**/*.scss").pipe(sass()).pipe(gulp.dest("dist/"));
});

gulp.task("watch", function () {
  // gulp.watch(["app/**/*.html", "!app/**/_*.html"], gulp.task("html"));
  gulp.watch(["app/**/*.ts", "!app/**/_*.ts"], gulp.task("ts"));
  // gulp.watch("app/**/*.+(scss|sass)", gulp.task("sass"));
});

gulp.task("default", gulp.parallel("watch"));
