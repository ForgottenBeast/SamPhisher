use strict;
use warnings;

use phisher;

my $app = phisher->apply_default_middlewares(phisher->psgi_app);
$app;

