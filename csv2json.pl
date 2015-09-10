#!/usr/bin/perl

# USAGE
# ./csv2json.pl < input.csv > output.json

print '{' . "\n";
print '  "feeds":[' . "\n";
my $row = <>;
chomp $row;
my @row_values = split ( /,/, $row );
my $feed_url = shift @row_values;
my $categories_string = '"' . join ( '","', @row_values ) . '"';
print '    {' . "\n";
print '      "url": "' . $feed_url . '",' . "\n";
print '      "category" = [' . $categories_string . ']' . "\n";
while ( my $row = <> ) {
    chomp $row;
    my @row_values = split(/,/, $row);
    my $feed_url = shift @row_values;
    my $categories_string = '"' . join ( '","', @row_values ) . '"';
    print '    },' . "\n";
    print '    {' . "\n";
    print '      "url": "' . $feed_url . '",' . "\n";
    print '      "category" = [' . $categories_string . ']' . "\n";
}

print '  ]' . "\n";
print '}' . "\n";
