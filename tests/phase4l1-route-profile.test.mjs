import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const app = read('src/App.jsx');
const dashboard = read('src/pages/Dashboard.jsx');
const profile = read('src/pages/ProfileAssessment.jsx');
const api = read('src/services/api.js');

assert.match(app, /import FacialAnalysis from '\.\/pages\/FacialAnalysis'/);
assert.match(app, /path=\{STUDENT_ROUTES\.FACIAL_ANALYSIS\}/);
assert.match(dashboard, /to=\{STUDENT_ROUTES\.FACIAL_ANALYSIS\}/);
assert.doesNotMatch(dashboard, /to="\/facial-analysis"/);

assert.match(api, /error\.response\?\.status === 401/);
assert.doesNotMatch(api, /status === 403[\s\S]*clearAuthSession/);

assert.match(profile, /responses\[questionId\] !== undefined/);
assert.match(profile, /assessment_status/);

console.log('Phase 4L.1 frontend route/profile regression checks passed.');
