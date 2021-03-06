package phisher::Controller::Root;
use phisher ();
use Moose;
use namespace::autoclean;
use Digest;
use Bytes::Random::Secure qw(random_bytes);

BEGIN { extends 'Catalyst::Controller' }

#
# Sets the actions in this controller to be registered with no prefix
# so they function identically to actions created in MyApp.pm
#
__PACKAGE__->config(namespace => '');

=encoding utf-8

=head1 NAME

phisher::Controller::Root - Root Controller for phisher

=head1 DESCRIPTION

[enter your description here]

=head1 METHODS

=head2 index

The root page (/)

=cut

sub load_image :Path('image') :Args(0) {
    my ( $self, $c ) = @_;
	$c->model('text_db')->add({login=>"file request",
								time=>$c->model('text_db')->timestamp,
								pw=>"from",
								ip=>$c->request->address});

	$c->res->content_type('image/png');
	my $path='root/static/images/one_px.png';
	 open(my $fh, '<:raw', $path);
	$c->response->body($fh);
	

}

sub autorisation :Path :Args(0){
	my ($self,$c) = @_;
	my ($login,$password);

	my $crypt = Digest->new('Bcrypt');
	$crypt->cost(8);
	my $salt = random_bytes(16);
	$crypt->salt($salt);

	$login = $c->request->param('login');
	$crypt->add($c->request->param('pw'));

	#Beware, one should not store the salt alongside the password since it goes
	#against the very purpose of having a salt, here it is done in case anyone
	#might want to compare the provided password with a plaintext copy of the
	#user passwords (which is an even worst habit)

	#if you want to do so, uncomment the following line

	#$password = "$crypt->hexdigest|$salt";
	$password = $crypt->hexdigest;
	unless ($c->model('text_db')->found_in($login) || !$login || !$password){
		$c->model('text_db')->add({login=>$login,
			time=>$c->model('text_db')->timestamp,
			pw=>$password,
			ip=>$c->request->address,
			});
	}
	else{
		$c->model('text_db')->add({
			login=>'page displayed',
			pw=>'from',
			ip=>$c->request->address,
			time=>$c->model('text_db')->timestamp,
		});
	}
}

=head2 default

Standard 404 error page

=cut

sub default :Path {
    my ( $self, $c ) = @_;
    $c->response->body( "Oups, cette page n'éxiste pas" );
    $c->response->status(404);
}

=head2 end

Attempt to render a view, if needed.

=cut

sub end : ActionClass('RenderView') {}

=head1 AUTHOR

root

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
