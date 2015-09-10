#!/usr/bin/perl

# USAGE
# ./csv2json.pl < input.csv > output.json

# INPUT FORMAT
# any number of lines of the form:
# feed_url,category_1,category_2,...,category_n

print '{' . "\n";
print '  "feeds":[' . "\n";

my $first_iter = 1;
while ( my $row = <> ) {
    chomp $row;
    my @row_values = split( /,/, $row );
    $feed_url = shift @row_values;
    $categories_string = '"' . join ( '","', @row_values ) . '"';
    print ",\n" unless $first_iter;
    $first_iter = 0;
    print "    {\n";
    print "      \"url\": \"$feed_url\",\n";
    print "      \"category\": [$categories_string]\n";
    print "    }";
}

print "\n";
print "  ]\n";
print "}\n;"
